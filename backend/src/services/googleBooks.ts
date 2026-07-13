import { env } from "../config/env";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export type GoogleBookResult = {
  idExterne: string;
  titre: string;
  description: string | null;
  couvertureUrl: string | null;
  datePublication: string | null;
  editeur: string | null;
  langue: string | null;
  nombrePages: number | null;
  auteurs: string[];
  genres: string[];
};

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

type GoogleSearchResponse = {
  items?: GoogleVolume[];
};

function buildUrl(path: string): URL {
  const url = new URL(path);
  if (env.googleBooksApiKey) {
    url.searchParams.set("key", env.googleBooksApiKey);
  }
  return url;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// L'API Google Books renvoie de temps en temps des 503 transitoires, sans rapport avec
// nos requêtes (vérifié en tapant l'API directement). On réessaie avec un backoff court ;
// on ne réessaie jamais sur un 4xx (ça n'a aucune chance de changer d'issue).
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 400;

async function fetchWithRetry(url: URL): Promise<Response> {
  let lastResponse: Response;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    lastResponse = await fetch(url);

    if (lastResponse.status < 500) {
      return lastResponse;
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  return lastResponse!;
}

// Google renvoie la description avec du HTML brut (<p>, <br>, <b>...) ; on la nettoie
// pour un affichage en texte simple, en gardant les sauts de ligne/paragraphe.
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function normalize(volume: GoogleVolume): GoogleBookResult {
  const info = volume.volumeInfo ?? {};
  return {
    idExterne: volume.id,
    titre: info.title ?? "Titre inconnu",
    description: info.description ? stripHtml(info.description) : null,
    // Google renvoie souvent les couvertures en http:// ; on force https pour éviter le contenu mixte.
    couvertureUrl: info.imageLinks?.thumbnail?.replace(/^http:/, "https:") ?? null,
    datePublication: info.publishedDate ?? null,
    editeur: info.publisher ?? null,
    langue: info.language ?? null,
    nombrePages: info.pageCount ?? null,
    auteurs: info.authors ?? [],
    genres: info.categories ?? [],
  };
}

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  const url = buildUrl(BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "20");

  const res = await fetchWithRetry(url);
  if (!res.ok) {
    throw new Error(`Échec de la recherche Google Books (${res.status})`);
  }

  const data = (await res.json()) as GoogleSearchResponse;
  return (data.items ?? []).map(normalize);
}

export async function getBookByExternalId(externalId: string): Promise<GoogleBookResult | null> {
  const url = buildUrl(`${BASE_URL}/${externalId}`);

  const res = await fetchWithRetry(url);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Échec de la récupération du livre Google Books (${res.status})`);
  }

  const volume = (await res.json()) as GoogleVolume;
  return normalize(volume);
}
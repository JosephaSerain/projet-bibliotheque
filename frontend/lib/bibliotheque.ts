import { apiFetch } from "./api";
import { StatutLecture } from "./statuts";

export type BibliothequeEntry = {
  id: number;
  dateAjout: string;
  dateDebutLecture: string | null;
  dateFinLecture: string | null;
  pageActuelle: number | null;
  noteGlobale: number | null;
  statuts: StatutLecture[];
};

export type BibliothequeListEntry = BibliothequeEntry & {
  livre: {
    id: number;
    idExterne: string;
    titre: string;
    couvertureUrl: string | null;
    auteurs: string[];
  };
};

export function addLivreToLists(livreId: number, statuts: StatutLecture[]) {
  return apiFetch<BibliothequeEntry>("/bibliotheque", {
    method: "POST",
    body: JSON.stringify({ livreId, statuts }),
  });
}

export function addStatut(livreId: number, statut: StatutLecture) {
  return apiFetch<{ statuts: StatutLecture[] }>(`/bibliotheque/livres/${livreId}/statuts/${statut}`, {
    method: "PUT",
  });
}

export function removeStatut(livreId: number, statut: StatutLecture) {
  return apiFetch<{ statuts: StatutLecture[] }>(`/bibliotheque/livres/${livreId}/statuts/${statut}`, {
    method: "DELETE",
  });
}

export function updateBibliotheque(
  livreId: number,
  data: { dateDebutLecture?: string | null; dateFinLecture?: string | null; pageActuelle?: number | null },
) {
  return apiFetch<BibliothequeEntry>(`/bibliotheque/livres/${livreId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function removeFromLibrary(livreId: number) {
  return apiFetch<void>(`/bibliotheque/livres/${livreId}`, { method: "DELETE" });
}

export function listBibliotheque(statut?: StatutLecture) {
  const query = statut ? `?statut=${statut}` : "";
  return apiFetch<BibliothequeListEntry[]>(`/bibliotheque${query}`);
}
import { prisma } from "../config/prisma";
import { getBookByExternalId, GoogleBookResult } from "./googleBooks";

const livreWithRelations = {
  include: {
    auteurs: { include: { auteur: true } },
    genres: { include: { genre: true } },
  },
} as const;

// Google renvoie des dates partielles ("2014", "2014-05") que Prisma (DateTime) n'accepte pas telles quelles.
function parsePublishedDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  let iso = value;
  if (/^\d{4}$/.test(value)) {
    iso = `${value}-01-01`;
  } else if (/^\d{4}-\d{2}$/.test(value)) {
    iso = `${value}-01`;
  }

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function cacheLivre(data: GoogleBookResult) {
  const livre = await prisma.livre.upsert({
    where: { idExterne: data.idExterne },
    update: {},
    create: {
      idExterne: data.idExterne,
      titre: data.titre,
      description: data.description,
      couvertureUrl: data.couvertureUrl,
      datePublication: parsePublishedDate(data.datePublication),
      editeur: data.editeur,
      langue: data.langue,
      nombrePages: data.nombrePages,
    },
  });

  for (const nom of data.auteurs) {
    const auteur = await prisma.auteur.upsert({ where: { nom }, update: {}, create: { nom } });
    await prisma.livreAuteur.upsert({
      where: { livreId_auteurId: { livreId: livre.id, auteurId: auteur.id } },
      update: {},
      create: { livreId: livre.id, auteurId: auteur.id },
    });
  }

  for (const nom of data.genres) {
    const genre = await prisma.genre.upsert({ where: { nom }, update: {}, create: { nom } });
    await prisma.livreGenre.upsert({
      where: { livreId_genreId: { livreId: livre.id, genreId: genre.id } },
      update: {},
      create: { livreId: livre.id, genreId: genre.id },
    });
  }

  return prisma.livre.findUniqueOrThrow({ where: { id: livre.id }, ...livreWithRelations });
}

// Cache-first : si le livre est déjà connu (id_externe), on renvoie la version en base.
// Sinon on va le chercher chez Google Books et on le persiste pour la prochaine fois.
export async function findOrCacheLivre(externalId: string) {
  const existing = await prisma.livre.findUnique({ where: { idExterne: externalId }, ...livreWithRelations });
  if (existing) {
    return existing;
  }

  const data = await getBookByExternalId(externalId);
  if (!data) {
    return null;
  }

  return cacheLivre(data);
}
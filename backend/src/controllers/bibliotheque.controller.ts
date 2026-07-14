import { StatutLecture } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/errorHandler";
import { AddLivreInput, UpdateBibliothequeInput } from "../schemas/bibliotheque.schema";
import { getOrCreateBibliotheque } from "../services/bibliotheque.service";
import { asyncHandler } from "../utils/asyncHandler";

const STATUTS_VALIDES = Object.values(StatutLecture);

// Prend directement `params` (plutôt qu'un `Request` entier) pour rester compatible avec
// les handlers dont le body est typé via Request<unknown, unknown, XxxInput> (ce qui, par
// effet de bord, type req.params en `unknown` puisque Params est le 1er générique d'Express).
function parseLivreId(params: Record<string, string>): number {
  const livreId = Number(params.livreId);
  if (!Number.isInteger(livreId)) {
    throw new HttpError(400, "livreId invalide");
  }
  return livreId;
}

function parseStatut(params: Record<string, string>): StatutLecture {
  const { statut } = params;
  if (!STATUTS_VALIDES.includes(statut as StatutLecture)) {
    throw new HttpError(400, `Statut invalide, attendu l'un de : ${STATUTS_VALIDES.join(", ")}`);
  }
  return statut as StatutLecture;
}

function serializeEntry(
  entry: {
    id: number;
    dateAjout: Date;
    dateDebutLecture: Date | null;
    dateFinLecture: Date | null;
    pageActuelle: number | null;
    noteGlobale: number | null;
  },
  statuts: StatutLecture[],
) {
  return {
    id: entry.id,
    dateAjout: entry.dateAjout,
    dateDebutLecture: entry.dateDebutLecture,
    dateFinLecture: entry.dateFinLecture,
    pageActuelle: entry.pageActuelle,
    noteGlobale: entry.noteGlobale,
    statuts,
  };
}

// GET /bibliotheque?statut=EN_COURS
export const listBibliotheque = asyncHandler(async (req: Request, res: Response) => {
  const { statut } = req.query;

  if (statut !== undefined && (typeof statut !== "string" || !STATUTS_VALIDES.includes(statut as StatutLecture))) {
    throw new HttpError(400, `Statut invalide, attendu l'un de : ${STATUTS_VALIDES.join(", ")}`);
  }

  const entries = await prisma.bibliotheque.findMany({
    where: {
      utilisateurId: req.userId,
      ...(statut ? { statuts: { some: { statut: statut as StatutLecture } } } : {}),
    },
    include: {
      livre: { include: { auteurs: { include: { auteur: true } } } },
      statuts: true,
    },
    orderBy: { dateAjout: "desc" },
  });

  res.json(
    entries.map((entry) => ({
      ...serializeEntry(
        entry,
        entry.statuts.map((s) => s.statut),
      ),
      livre: {
        id: entry.livre.id,
        idExterne: entry.livre.idExterne,
        titre: entry.livre.titre,
        couvertureUrl: entry.livre.couvertureUrl,
        auteurs: entry.livre.auteurs.map((la) => la.auteur.nom),
      },
    })),
  );
});

// POST /bibliotheque — ajoute un livre à une ou plusieurs listes en même temps.
export const addToBibliotheque = asyncHandler(async (req: Request<unknown, unknown, AddLivreInput>, res: Response) => {
  const { livreId, statuts } = req.body;

  const livre = await prisma.livre.findUnique({ where: { id: livreId } });
  if (!livre) {
    throw new HttpError(404, "Livre introuvable");
  }

  const bibliotheque = await getOrCreateBibliotheque(req.userId!, livreId);

  for (const statut of statuts) {
    await prisma.bibliothequeStatut.upsert({
      where: { bibliothequeId_statut: { bibliothequeId: bibliotheque.id, statut } },
      update: {},
      create: { bibliothequeId: bibliotheque.id, statut },
    });
  }

  const allStatuts = await prisma.bibliothequeStatut.findMany({ where: { bibliothequeId: bibliotheque.id } });
  res.json(
    serializeEntry(
      bibliotheque,
      allStatuts.map((s) => s.statut),
    ),
  );
});

// PUT /bibliotheque/livres/:livreId/statuts/:statut — ajoute une liste, indépendamment des autres.
export const addStatut = asyncHandler(async (req: Request, res: Response) => {
  const livreId = parseLivreId(req.params);
  const statut = parseStatut(req.params);

  const bibliotheque = await getOrCreateBibliotheque(req.userId!, livreId);
  await prisma.bibliothequeStatut.upsert({
    where: { bibliothequeId_statut: { bibliothequeId: bibliotheque.id, statut } },
    update: {},
    create: { bibliothequeId: bibliotheque.id, statut },
  });

  const statuts = await prisma.bibliothequeStatut.findMany({ where: { bibliothequeId: bibliotheque.id } });
  res.json({ statuts: statuts.map((s) => s.statut) });
});

// DELETE /bibliotheque/livres/:livreId/statuts/:statut — retire une liste, indépendamment des autres.
export const removeStatut = asyncHandler(async (req: Request, res: Response) => {
  const livreId = parseLivreId(req.params);
  const statut = parseStatut(req.params);

  const bibliotheque = await prisma.bibliotheque.findUnique({
    where: { utilisateurId_livreId: { utilisateurId: req.userId!, livreId } },
  });

  if (bibliotheque) {
    await prisma.bibliothequeStatut.deleteMany({ where: { bibliothequeId: bibliotheque.id, statut } });
  }

  const statuts = bibliotheque
    ? (await prisma.bibliothequeStatut.findMany({ where: { bibliothequeId: bibliotheque.id } })).map((s) => s.statut)
    : [];
  res.json({ statuts });
});

// PATCH /bibliotheque/livres/:livreId — dates de lecture, page actuelle.
export const updateBibliotheque = asyncHandler(
  async (req: Request<Record<string, string>, unknown, UpdateBibliothequeInput>, res: Response) => {
    const livreId = parseLivreId(req.params);
    const { dateDebutLecture, dateFinLecture, pageActuelle } = req.body;

    const bibliotheque = await getOrCreateBibliotheque(req.userId!, livreId);

    let updated = await prisma.bibliotheque.update({
      where: { id: bibliotheque.id },
      data: {
        ...(dateDebutLecture !== undefined && { dateDebutLecture: dateDebutLecture ? new Date(dateDebutLecture) : null }),
        ...(dateFinLecture !== undefined && { dateFinLecture: dateFinLecture ? new Date(dateFinLecture) : null }),
        ...(pageActuelle !== undefined && { pageActuelle }),
      },
    });

    // Auto-complétion : la page actuelle atteint le nombre de pages du livre ->
    // passage automatique en "Lu", retrait de "En cours", date de fin renseignée si absente.
    if (pageActuelle != null) {
      const livre = await prisma.livre.findUnique({ where: { id: livreId } });
      if (livre?.nombrePages && pageActuelle >= livre.nombrePages) {
        await prisma.bibliothequeStatut.upsert({
          where: { bibliothequeId_statut: { bibliothequeId: bibliotheque.id, statut: "LU" } },
          update: {},
          create: { bibliothequeId: bibliotheque.id, statut: "LU" },
        });
        await prisma.bibliothequeStatut.deleteMany({
          where: { bibliothequeId: bibliotheque.id, statut: "EN_COURS" },
        });
        if (!updated.dateFinLecture) {
          updated = await prisma.bibliotheque.update({
            where: { id: bibliotheque.id },
            data: { dateFinLecture: new Date() },
          });
        }
      }
    }

    const statuts = await prisma.bibliothequeStatut.findMany({ where: { bibliothequeId: bibliotheque.id } });
    res.json(
      serializeEntry(
        updated,
        statuts.map((s) => s.statut),
      ),
    );
  },
);

// DELETE /bibliotheque/livres/:livreId — retire complètement le livre (toutes listes confondues).
export const removeFromBibliotheque = asyncHandler(async (req: Request, res: Response) => {
  const livreId = parseLivreId(req.params);
  await prisma.bibliotheque.deleteMany({ where: { utilisateurId: req.userId, livreId } });
  res.status(204).send();
});
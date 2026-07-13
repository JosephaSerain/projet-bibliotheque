import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/errorHandler";
import { searchBooks } from "../services/googleBooks";
import { findOrCacheLivre } from "../services/livre.service";
import { asyncHandler } from "../utils/asyncHandler";

export const searchLivres = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (typeof q !== "string" || q.trim() === "") {
    throw new HttpError(400, "Le paramètre de recherche q est requis");
  }

  const results = await searchBooks(q);
  res.json(results);
});

export const getLivre = asyncHandler(async (req: Request, res: Response) => {
  const { externalId } = req.params;

  const livre = await findOrCacheLivre(externalId);
  if (!livre) {
    throw new HttpError(404, "Livre introuvable");
  }

  let statuts: string[] = [];
  if (req.userId) {
    const bibliotheque = await prisma.bibliotheque.findUnique({
      where: { utilisateurId_livreId: { utilisateurId: req.userId, livreId: livre.id } },
      include: { statuts: true },
    });
    statuts = bibliotheque?.statuts.map((s) => s.statut) ?? [];
  }

  res.json({
    id: livre.id,
    idExterne: livre.idExterne,
    titre: livre.titre,
    description: livre.description,
    couvertureUrl: livre.couvertureUrl,
    datePublication: livre.datePublication,
    editeur: livre.editeur,
    langue: livre.langue,
    nombrePages: livre.nombrePages,
    auteurs: livre.auteurs.map((la) => la.auteur.nom),
    genres: livre.genres.map((lg) => lg.genre.nom),
    statuts,
  });
});
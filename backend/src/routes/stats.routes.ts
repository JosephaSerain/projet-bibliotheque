import { Router } from "express";

export const statsRouter = Router();

// GET /stats/summary          nb livres lus / en cours / abandonnés
// GET /stats/preferences      genres et critères favoris
// GET /stats/reading-time     durée moyenne de lecture
// GET /stats/pace             moyenne de livres lus par mois
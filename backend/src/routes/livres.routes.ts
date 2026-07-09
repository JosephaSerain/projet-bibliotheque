import { Router } from "express";

export const livresRouter = Router();

// GET /livres/search?q=...        recherche via Google Books API
// GET /livres/:id                 fiche détaillée d'un livre (cache local)
import { Router } from "express";
import { getLivre, searchLivres } from "../controllers/livre.controller";
import { optionalAuth } from "../middlewares/optionalAuth";

export const livresRouter = Router();

// L'ordre compte : /search doit être déclaré avant /:externalId, sinon Express
// interpréterait "search" comme une valeur d'externalId.
livresRouter.get("/search", searchLivres);
livresRouter.get("/:externalId", optionalAuth, getLivre);
import { Router } from "express";
import {
  addStatut,
  addToBibliotheque,
  listBibliotheque,
  removeFromBibliotheque,
  removeStatut,
  updateBibliotheque,
} from "../controllers/bibliotheque.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { addLivreSchema, updateBibliothequeSchema } from "../schemas/bibliotheque.schema";

export const bibliothequeRouter = Router();

// Toutes les routes de la bibliothèque nécessitent d'être connecté.
bibliothequeRouter.use(requireAuth);

bibliothequeRouter.get("/", listBibliotheque);
bibliothequeRouter.post("/", validate(addLivreSchema), addToBibliotheque);
bibliothequeRouter.patch("/livres/:livreId", validate(updateBibliothequeSchema), updateBibliotheque);
bibliothequeRouter.delete("/livres/:livreId", removeFromBibliotheque);
bibliothequeRouter.put("/livres/:livreId/statuts/:statut", addStatut);
bibliothequeRouter.delete("/livres/:livreId/statuts/:statut", removeStatut);
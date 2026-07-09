import { Router } from "express";

export const bibliothequeRouter = Router();

// GET    /bibliotheque?statut=EN_COURS      lister mes livres, filtré par liste
// POST   /bibliotheque                      ajouter un livre à une ou plusieurs listes
// PATCH  /bibliotheque/:id                  maj dates de lecture / page actuelle / note globale
// POST   /bibliotheque/:id/statuts          ajouter une liste sur ce livre
// DELETE /bibliotheque/:id/statuts/:statut  retirer une liste sur ce livre
// DELETE /bibliotheque/:id                  retirer complètement le livre (toutes listes)
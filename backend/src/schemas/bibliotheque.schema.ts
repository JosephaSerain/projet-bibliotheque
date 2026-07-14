import { z } from "zod";

const STATUTS = ["A_LIRE", "EN_COURS", "LU", "ABANDONNE"] as const;

// Accepte aussi bien une date simple ("2026-07-01", venant d'un <input type="date">)
// qu'un ISO complet, plutôt que le format strict qu'impose z.string().datetime().
const dateString = z.string().refine((val) => !Number.isNaN(Date.parse(val)), { message: "Date invalide" });

export const addLivreSchema = z.object({
  livreId: z.number().int().positive(),
  statuts: z.array(z.enum(STATUTS)).min(1, "Au moins une liste est requise"),
});

export const updateBibliothequeSchema = z
  .object({
    dateDebutLecture: dateString.nullable().optional(),
    dateFinLecture: dateString.nullable().optional(),
    pageActuelle: z.number().int().min(0).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Aucune donnée à mettre à jour" });

export type AddLivreInput = z.infer<typeof addLivreSchema>;
export type UpdateBibliothequeInput = z.infer<typeof updateBibliothequeSchema>;
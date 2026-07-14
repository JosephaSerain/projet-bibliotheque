import { prisma } from "../config/prisma";

// Récupère l'entrée bibliothèque (utilisateur x livre), ou la crée si c'est la première
// interaction (ajout à une liste, dates de lecture...) sur ce livre pour cet utilisateur.
export async function getOrCreateBibliotheque(utilisateurId: number, livreId: number) {
  return prisma.bibliotheque.upsert({
    where: { utilisateurId_livreId: { utilisateurId, livreId } },
    update: {},
    create: { utilisateurId, livreId },
  });
}
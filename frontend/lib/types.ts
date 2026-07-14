export type LivreRecherche = {
  idExterne: string;
  titre: string;
  description: string | null;
  couvertureUrl: string | null;
  datePublication: string | null;
  editeur: string | null;
  langue: string | null;
  nombrePages: number | null;
  auteurs: string[];
  genres: string[];
};

// Fiche détaillée : mêmes champs + l'id interne et mes infos de bibliothèque (si connecté).
export type LivreDetail = LivreRecherche & {
  id: number;
  statuts: string[];
  dateDebutLecture: string | null;
  dateFinLecture: string | null;
  pageActuelle: number | null;
};
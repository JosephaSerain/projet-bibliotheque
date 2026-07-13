export type StatutLecture = "A_LIRE" | "EN_COURS" | "LU" | "ABANDONNE";

export const STATUT_LABELS: Record<StatutLecture, string> = {
  A_LIRE: "À lire",
  EN_COURS: "En cours",
  LU: "Lu",
  ABANDONNE: "Abandonné",
};

export const STATUT_COLOR_VAR: Record<StatutLecture, string> = {
  A_LIRE: "var(--tab-alire)",
  EN_COURS: "var(--tab-encours)",
  LU: "var(--tab-lu)",
  ABANDONNE: "var(--tab-abandonne)",
};
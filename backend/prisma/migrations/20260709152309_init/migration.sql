-- CreateEnum
CREATE TYPE "StatutLecture" AS ENUM ('A_LIRE', 'EN_COURS', 'LU', 'ABANDONNE');

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar_url" TEXT,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livre" (
    "id" SERIAL NOT NULL,
    "id_externe" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "couverture_url" TEXT,
    "date_publication" TIMESTAMP(3),
    "editeur" TEXT,
    "langue" TEXT,
    "nombre_pages" INTEGER,

    CONSTRAINT "livre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auteur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "auteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livre_auteur" (
    "id_livre" INTEGER NOT NULL,
    "id_auteur" INTEGER NOT NULL,

    CONSTRAINT "livre_auteur_pkey" PRIMARY KEY ("id_livre","id_auteur")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livre_genre" (
    "id_livre" INTEGER NOT NULL,
    "id_genre" INTEGER NOT NULL,

    CONSTRAINT "livre_genre_pkey" PRIMARY KEY ("id_livre","id_genre")
);

-- CreateTable
CREATE TABLE "critere" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "critere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bibliotheque" (
    "id" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_livre" INTEGER NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_debut_lecture" TIMESTAMP(3),
    "date_fin_lecture" TIMESTAMP(3),
    "page_actuelle" INTEGER,
    "note_globale" INTEGER,

    CONSTRAINT "bibliotheque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bibliotheque_statut" (
    "id" SERIAL NOT NULL,
    "id_bibliotheque" INTEGER NOT NULL,
    "statut" "StatutLecture" NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bibliotheque_statut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" SERIAL NOT NULL,
    "id_bibliotheque" INTEGER NOT NULL,
    "texte" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_critere" (
    "id" SERIAL NOT NULL,
    "id_bibliotheque" INTEGER NOT NULL,
    "id_critere" INTEGER NOT NULL,
    "valeur" INTEGER NOT NULL,

    CONSTRAINT "note_critere_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "livre_id_externe_key" ON "livre"("id_externe");

-- CreateIndex
CREATE UNIQUE INDEX "genre_nom_key" ON "genre"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "critere_nom_key" ON "critere"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "bibliotheque_id_utilisateur_id_livre_key" ON "bibliotheque"("id_utilisateur", "id_livre");

-- CreateIndex
CREATE UNIQUE INDEX "bibliotheque_statut_id_bibliotheque_statut_key" ON "bibliotheque_statut"("id_bibliotheque", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "avis_id_bibliotheque_key" ON "avis"("id_bibliotheque");

-- CreateIndex
CREATE UNIQUE INDEX "note_critere_id_bibliotheque_id_critere_key" ON "note_critere"("id_bibliotheque", "id_critere");

-- AddForeignKey
ALTER TABLE "livre_auteur" ADD CONSTRAINT "livre_auteur_id_livre_fkey" FOREIGN KEY ("id_livre") REFERENCES "livre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livre_auteur" ADD CONSTRAINT "livre_auteur_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "auteur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livre_genre" ADD CONSTRAINT "livre_genre_id_livre_fkey" FOREIGN KEY ("id_livre") REFERENCES "livre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livre_genre" ADD CONSTRAINT "livre_genre_id_genre_fkey" FOREIGN KEY ("id_genre") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bibliotheque" ADD CONSTRAINT "bibliotheque_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bibliotheque" ADD CONSTRAINT "bibliotheque_id_livre_fkey" FOREIGN KEY ("id_livre") REFERENCES "livre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bibliotheque_statut" ADD CONSTRAINT "bibliotheque_statut_id_bibliotheque_fkey" FOREIGN KEY ("id_bibliotheque") REFERENCES "bibliotheque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_bibliotheque_fkey" FOREIGN KEY ("id_bibliotheque") REFERENCES "bibliotheque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_critere" ADD CONSTRAINT "note_critere_id_bibliotheque_fkey" FOREIGN KEY ("id_bibliotheque") REFERENCES "bibliotheque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_critere" ADD CONSTRAINT "note_critere_id_critere_fkey" FOREIGN KEY ("id_critere") REFERENCES "critere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

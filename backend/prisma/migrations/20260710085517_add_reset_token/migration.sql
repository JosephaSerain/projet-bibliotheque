-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_reset_token_key" ON "utilisateur"("reset_token");
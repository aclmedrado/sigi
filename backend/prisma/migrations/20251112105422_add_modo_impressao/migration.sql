-- CreateEnum
CREATE TYPE "ModoImpressao" AS ENUM ('FRENTE', 'FRENTE_VERSO');

-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "modo_impressao" "ModoImpressao" NOT NULL DEFAULT 'FRENTE_VERSO';

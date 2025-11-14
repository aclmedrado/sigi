-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "paginas_documento" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "copias_solicitadas" DROP NOT NULL;

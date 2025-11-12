/*
  Warnings:

  - Made the column `copias_solicitadas` on table `Solicitacao` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Solicitacao" ALTER COLUMN "copias_solicitadas" SET NOT NULL;

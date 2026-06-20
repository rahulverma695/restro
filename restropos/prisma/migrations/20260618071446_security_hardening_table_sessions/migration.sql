/*
  Warnings:

  - Added the required column `pin` to the `TableSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TableSession" ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pin" TEXT NOT NULL;

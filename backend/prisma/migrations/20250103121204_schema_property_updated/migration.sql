/*
  Warnings:

  - You are about to drop the column `tranlatedText` on the `translations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "translations" DROP COLUMN "tranlatedText",
ADD COLUMN     "translatedText" TEXT;

/*
  Warnings:

  - You are about to drop the column `isItResponse` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Message` table. All the data in the column will be lost.
  - Added the required column `question` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isItResponse",
DROP COLUMN "metadata",
ADD COLUMN     "question" TEXT NOT NULL;

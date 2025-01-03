-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'AUTHENTICATED', 'PRIVATE');

-- AlterTable
ALTER TABLE "translations" ADD COLUMN     "userId" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

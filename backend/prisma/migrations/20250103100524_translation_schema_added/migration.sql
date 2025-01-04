-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "tranlatedText" TEXT NOT NULL,
    "pdfLink" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

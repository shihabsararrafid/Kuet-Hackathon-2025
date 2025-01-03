import { NextFunction, Request, Response } from "express";
import { PrismaClient, translations } from "@prisma/client";
import path from "path";
const prisma = new PrismaClient();
// Middleware to check PDF access
export const checkPdfAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract filename from the URL
    console.log(req.hostname);
    const pdfFileName = path.basename(req.path);
    const translation = await prisma.translations.findFirst({
      where: {
        pdfLink: "http://localhost:5000/files/" + pdfFileName,
      },
    });
    console.log(translation, "http://localhost:5000/files/" + pdfFileName);
    if (!translation)
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    // If no record found or PDF is not public
    if (!(await checkAccess(translation, req?.user?.id))) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This PDF is not public.",
      });
    }

    // Update visit count
    await prisma.translations.update({
      where: { id: translation.id },
      data: {
        totalVisits: {
          increment: 1,
        },
      },
    });

    // Continue to serve the file
    next();
  } catch (error) {
    console.error("Error checking PDF access:", error);
    res.status(500).json({
      success: false,
      message: "Error accessing PDF",
      error: error instanceof Error ? error.message : "Unknown Error",
    });
  }
};
const checkAccess = async (
  translation: translations,
  currentUserId: string,
) => {
  switch (translation.visibility) {
    case "PUBLIC":
      return true;

    case "AUTHENTICATED":
      // Check if user is logged in
      return !!currentUserId;

    case "PRIVATE":
      // Check if user is the owner
      return currentUserId && currentUserId === translation.userId;

    default:
      return false;
  }
};

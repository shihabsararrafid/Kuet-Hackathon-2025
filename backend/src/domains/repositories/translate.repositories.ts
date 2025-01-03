import bcrypt from "bcrypt";
import { parse } from "node-html-parser";
import { $Enums, PrismaClient, translations, User } from "@prisma/client";
import { BaseRepository } from "../../domains/repositories/base.repository";
import { AppError } from "../../libraries/error-handling/AppError";
import path, { join } from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import axios from "axios";
import htmlPdf from "html-pdf-node";
export default class TranslationRepository extends BaseRepository<translations> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  async getAll(userId: string): Promise<Partial<translations>[]> {
    try {
      const result = await this.prisma.translations.findMany({
        where: {
          userId,
        },
      });
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to load translations: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  getById(id: string): Promise<Partial<translations> | null> {
    throw new Error("Method not implemented.");
  }
  async translate(
    data: { rawText: string },
    userId: string,
  ): Promise<Partial<translations>> {
    try {
      // Store the original formatted text
      const formattedText = data.rawText;

      // Strip HTML tags for API request using node-html-parser
      const root = parse(data.rawText);
      const rawTextWithoutHtml = root.textContent;

      //   console.log("Stripped text:", rawTextWithoutHtml);

      // Call translation API with stripped text
      const response = await axios.post("http://192.168.11.97:6000/translate", {
        text: rawTextWithoutHtml,
      });
      if (!response) {
        throw new Error("Translation service failed");
      }
      // Get translated pieces
      const translatedText = response.data.translation; // "কি কর আমি ছিনি না"
      const translatedWords = translatedText.split(" "); // ['কি', 'কর', 'আমি', 'ছিনি', 'না']
      let currentIndex = 0;
      // Create new HTML by replacing text content while preserving structure
      const htmlRoot = parse(formattedText);
      const replaceText = (node: any) => {
        // Only replace text in text nodes, not in tags
        if (node.constructor.name === "TextNode") {
          const originalText = node.text.trim();
          if (originalText) {
            const wordCount = originalText.split(" ").filter(Boolean).length;
            const replacement = translatedWords
              .slice(currentIndex, currentIndex + wordCount)
              .join(" ");
            currentIndex += wordCount;

            // Preserve original whitespace
            const leadingSpace = node.text.match(/^\s*/)[0];
            const trailingSpace = node.text.match(/\s*$/)[0];
            node.rawText = leadingSpace + replacement + trailingSpace;
          }
        }

        // Process child nodes if they exist
        if (node.childNodes) {
          node.childNodes.forEach(replaceText);
        }
      };

      htmlRoot.childNodes.forEach(replaceText);
      const formattedTranslation = htmlRoot.toString();
      //   console.log(formattedTranslation);
      // Save to database
      return this.prisma.translations.create({
        data: {
          rawText: formattedText,
          translatedText: formattedTranslation,
          userId,
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to translate your text: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }

  async generatePdf(data: { isPublic: boolean }, id: string): Promise<any> {
    try {
      const translations = await this.prisma.translations.findUnique({
        where: { id },
      });

      const uploadDir = join(process.cwd(), "data/pdf");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate filename
      const randomString = await bcrypt.genSalt(20);
      const filename = `document_${randomString}_${id}.pdf`;
      const filePath = path.join(uploadDir, filename);

      // Create HTML content
      const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .translated-text {
                        margin-top: 20px;
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="translated-text">
                    ${translations?.translatedText ?? ""}
                </div>
            </body>
            </html>
        `;

      // PDF generation options
      const options = {
        format: "A4",
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        printBackground: true,
      };

      // Generate PDF with error handling
      let pdfBuffer;
      try {
        const file = { content: htmlContent };
        pdfBuffer = await htmlPdf.generatePdf(file, options);
      } catch (error) {
        console.error("PDF generation error:", error);
        throw new AppError(
          "pdf-generation-error",
          "Failed to generate PDF",
          500,
        );
      }

      // Save the PDF with error handling
      try {
        await fs.promises.writeFile(filePath, pdfBuffer as any);
      } catch (error) {
        console.error("Error saving PDF:", error);
        throw new AppError("file-system-error", "Failed to save PDF file", 500);
      }
      const fileLink = `http://localhost:5000/files/${filename}`;
      const pdf = await this.prisma.translations.update({
        where: { id },
        data: {
          pdfLink: fileLink,
          isPublic: data.isPublic,
        },
      });

      return pdf;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to generate PDF: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  async updateShareAbility(
    data: { visibility: $Enums.Visibility },
    id: string,
  ): Promise<any> {
    try {
      const result = await this.prisma.translations.update({
        where: {
          id,
        },
        data: {
          visibility: data.visibility,
        },
      });
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to generate PDF: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  update(id: string, data: Partial<User>): Promise<Partial<User>> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<Partial<User>> {
    throw new Error("Method not implemented.");
  }
}

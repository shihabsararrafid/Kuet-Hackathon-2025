import bcrypt from "bcrypt";
import { PrismaClient, translations, User } from "@prisma/client";
import { BaseRepository } from "../../domains/repositories/base.repository";
import { AppError } from "../../libraries/error-handling/AppError";
import path, { join } from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
export default class TranslationRepository extends BaseRepository<translations> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  getAll(): Promise<Partial<translations>[]> {
    throw new Error("Method not implemented.");
  }
  getById(id: string): Promise<Partial<translations> | null> {
    throw new Error("Method not implemented.");
  }
  async translate(data: { rawText: string }): Promise<Partial<translations>> {
    // generate salt and hashed password

    try {
      return this.prisma.translations.create({
        data: {
          rawText: data.rawText,
          tranlatedText: "আশা করি তুমি  ভালো আছো",
        },
      });
    } catch (error) {
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
      if (translations?.pdfLink) {
        return {
          message: "Pdf has been created once",
          link: translations.pdfLink,
        };
      }
      const uploadDir = join(process.cwd(), "data/pdf");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      //   console.log(uploadDir);
      // Generate unique filename
      const randomString = await bcrypt.genSalt(20);
      const filename = `document_${randomString}_${id}.pdf`;
      const filePath = path.join(uploadDir, filename);

      // Create a write stream
      const writeStream = fs.createWriteStream(filePath);

      // Create PDF document
      const doc = new PDFDocument();

      // Pipe the PDF into the write stream
      doc.pipe(writeStream);

      // Add content to PDF
      doc.font("Times-Roman").fontSize(12).text(`this is a test text`);

      // Finalize the PDF
      doc.end();

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
          `Failed to translate your text: ${
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

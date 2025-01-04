import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat, PrismaClient, User } from "@prisma/client";
import config from "../../configs";
import { BaseRepository } from "../../domains/repositories/base.repository";
import { AppError } from "../../libraries/error-handling/AppError";
import axios from "axios";
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
import pdf from "pdf-parse";
import { join } from "path";
export default class ChatbotRepository extends BaseRepository<Chat> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  async getBengaliText(msg: string) {
    try {
      const response = await axios.post("http://192.168.11.97:6000/translate", {
        text: msg,
      });
      if (!response) {
        throw new Error("Translation service failed");
      }
      // Get translated pieces
      const translatedText = response.data.translation;
      return translatedText;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed translate data from banglish: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  async createChat(
    message: string,
    userId: string,
    translated = false,
  ): Promise<Partial<any>> {
    try {
      const translatedText = translated
        ? message
        : await this.getBengaliText(message);
      // Sanitize the text to remove null characters and ensure proper encoding
      const sanitizedText = translatedText
        .replace(/\u0000/g, "") // Remove null characters
        .trim(); // Remove leading/trailing whitespace

      // Generate AI response
      const response = await model.generateContent(sanitizedText);
      const aiResponseText = response.response
        .text()
        .replace(/\u0000/g, "") // Also sanitize AI response
        .trim();

      // Create chat with sanitized text
      const result = await this.prisma.chat.create({
        data: {
          title: sanitizedText.substring(0, 50), // Truncate for title if needed
          userId,
          messages: {
            create: {
              id: 1,
              question: sanitizedText,
              content: aiResponseText,
            },
          },
        },
        include: {
          messages: true,
        },
      });
      //   console.log(result);
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
  async getResponseFromPdf(pdfUrl: string, userId: string): Promise<any> {
    try {
      const filePath = "data/pdf/" + pdfUrl.split("files")?.[1];
      let dataBuffer = fs.readFileSync(join(process.cwd(), filePath));

      // Use await with pdf parsing to ensure the operation is complete
      const pdfData = await pdf(dataBuffer);

      if (pdfData.text) {
        const result = await this.createChat(pdfData.text, userId, true);
        return result;
      }

      throw new AppError("pdf-processing-error", "No text found in PDF", 400);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to process PDF: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  async addMessageToChat(
    chatId: string,
    message: string,
  ): Promise<Partial<any>> {
    try {
      const translatedText = await this.getBengaliText(message);
      const response = await model.generateContent(translatedText);
      const transaction = await this.prisma.$transaction(async (tx) => {
        const latestMessage = await tx.message.findFirst({
          where: {
            chatId,
          },
          orderBy: {
            id: "desc",
          },
        });
        if (latestMessage) {
          const result = await tx.message.create({
            data: {
              chatId,
              id: latestMessage.id + 1,
              question: translatedText,
              content: response.response.text(),
            },
          });
          return result;
        }
      });

      return transaction ?? {};
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
  async getChats(userId: string): Promise<Partial<any>> {
    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          userId,
        },
        include: {
          messages: true,
        },
      });
      return chats;
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
  getById(id: string): Promise<Partial<Chat> | null> {
    throw new Error("Method not implemented.");
  }

  update(id: string, data: Partial<User>): Promise<Partial<User>> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<Partial<User>> {
    throw new Error("Method not implemented.");
  }
}

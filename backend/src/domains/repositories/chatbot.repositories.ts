import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat, PrismaClient, User } from "@prisma/client";
import config from "../../configs";
import { BaseRepository } from "../../domains/repositories/base.repository";
import { AppError } from "../../libraries/error-handling/AppError";
import axios from "axios";
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
  async createChat(message: string, userId: string): Promise<Partial<any>> {
    try {
      const translatedText = await this.getBengaliText(message);
      //   console.log(translatedText);
      const response = await model.generateContent(translatedText);
      const result = await this.prisma.chat.create({
        data: {
          title: "",
          userId,
          messages: {
            create: {
              id: 1,
              question: translatedText,
              content: response.response.text(),
            },
          },
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

import { NextFunction, Request, Response } from "express";
import { BaseController } from "../../domains/controllers/base.controller";
import { AppError } from "../../libraries/error-handling/AppError";
import ChatbotRepository from "../repositories/chatbot.repositories";

export default class ChatbotController extends BaseController {
  private chatbotRepository: ChatbotRepository;
  constructor(chatbotRepository: ChatbotRepository) {
    super();
    this.chatbotRepository = chatbotRepository;
  }
  async translateText(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.chatbotRepository.createChat(
        req.body.message,
        req.user.id,
      );
      this.sendSuccessResponse(res, user);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async createChatFromPDfs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const translations = await this.chatbotRepository.getResponseFromPdf(
        req.body.pdfLink,
        req.user.id,
      );
      this.sendSuccessResponse(res, translations);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async addMessageToText(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { chatId } = req.params;
      const messages = await this.chatbotRepository.addMessageToChat(
        chatId,
        req.body.message,
      );
      this.sendSuccessResponse(res, messages);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async getAllChats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const messages = await this.chatbotRepository.getChats(req.user.id);
      this.sendSuccessResponse(res, messages);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
}

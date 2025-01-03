import { NextFunction, Request, Response } from "express";
import { BaseController } from "../../domains/controllers/base.controller";
import { AppError } from "../../libraries/error-handling/AppError";
import TranslationRepository from "../repositories/translate.repositories";
export default class TranslationController extends BaseController {
  private translationRepository: TranslationRepository;
  constructor(translationRepository: TranslationRepository) {
    super();
    this.translationRepository = translationRepository;
  }
  async translateText(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.translationRepository.translate(
        req.body,
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
  async getTranslations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const translations = await this.translationRepository.getAll(req.user.id);
      this.sendSuccessResponse(res, translations);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  async getPublicTranslations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const translations = await this.translationRepository.getAllPublic(
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
  async generatePdf(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.translationRepository.generatePdf(req.body, id);
      this.sendSuccessResponse(res, user);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async updatePDFShareability(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.translationRepository.updateShareAbility(
        req.body,
        id,
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
}

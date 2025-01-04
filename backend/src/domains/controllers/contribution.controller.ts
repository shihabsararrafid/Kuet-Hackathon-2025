import { NextFunction, Request, Response } from "express";
import { BaseController } from "../../domains/controllers/base.controller";
import { AppError } from "../../libraries/error-handling/AppError";
import ContributionRepository from "../repositories/contribution.repositories";

export default class ContributionController extends BaseController {
  private contributionRepository: ContributionRepository;

  constructor(contributionRepository: ContributionRepository) {
    super();
    this.contributionRepository = contributionRepository;
  }

  // Create a new contribution
  async createContribution(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log("hello here");
      const contribution = await this.contributionRepository.create({
        banglishText: req.body.banglishText,
        banglaText: req.body.banglaText,
        userId: req.user.id,
      });
      this.sendSuccessResponse(res, contribution);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  // Get user's contributions
  async getUserContributions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Optional query parameter to filter by approval status
      const isApproved = req.query.isApproved
        ? req.query.isApproved === "true"
        : undefined;

      const contributions = await this.contributionRepository.getAll(
        req.user.id,
        isApproved,
      );
      this.sendSuccessResponse(res, contributions);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  // Get all contributions (admin functionality)
  async getAllContributions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Optional query parameter to filter by approval status
      const isApproved = req.query.isApproved
        ? req.query.isApproved === "true"
        : undefined;

      const contributions =
        await this.contributionRepository.getAllContributions(isApproved);
      this.sendSuccessResponse(res, contributions);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  // Get a specific contribution by ID
  async getContributionById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const contribution = await this.contributionRepository.getById(id);

      if (!contribution) {
        throw new AppError("not-found", "Contribution not found", 404);
      }

      this.sendSuccessResponse(res, contribution);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  // Update a contribution
  async updateContribution(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Ensure user can only update their own contributions
      const existingContribution =
        await this.contributionRepository.getById(id);
      if (
        !existingContribution ||
        existingContribution.userId !== req.user.id
      ) {
        throw new AppError(
          "unauthorized",
          "You cannot update this contribution",
          403,
        );
      }

      const updatedContribution = await this.contributionRepository.update(id, {
        banglishText: req.body.banglishText,
        banglaText: req.body.banglaText,
      });

      this.sendSuccessResponse(res, updatedContribution);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  // Update contribution approval status (admin functionality)
  async updateApprovalStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const updatedContribution =
        await this.contributionRepository.updateApprovalStatus(id, isApproved);

      this.sendSuccessResponse(res, updatedContribution);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }

  // Delete a contribution
  async deleteContribution(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const deletedContribution = await this.contributionRepository.delete(
        id,
        req.user.id,
      );

      this.sendSuccessResponse(res, deletedContribution);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
}

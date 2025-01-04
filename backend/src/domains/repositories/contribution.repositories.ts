import { PrismaClient, Contribution, User } from "@prisma/client";
import { BaseRepository } from "../../domains/repositories/base.repository";
import { AppError } from "../../libraries/error-handling/AppError";

export default class ContributionRepository extends BaseRepository<Contribution> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  // Get all contributions for a specific user
  async getAll(userId: string, isApproved?: boolean): Promise<Contribution[]> {
    try {
      return await this.prisma.contribution.findMany({
        where: {
          userId,
          ...(isApproved !== undefined && { isApproved }),
        },
        orderBy: {
          id: "desc",
        },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to load contributions");
    }
  }

  // Get all contributions (for admin)
  async getAllContributions(isApproved?: boolean): Promise<Contribution[]> {
    try {
      return await this.prisma.contribution.findMany({
        where: {
          ...(isApproved !== undefined && { isApproved }),
        },
        include: {
          user: {
            select: {
              id: true,

              email: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to load contributions");
    }
  }

  // Get contribution by ID
  async getById(id: string): Promise<Contribution | null> {
    try {
      return await this.prisma.contribution.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,

              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to retrieve contribution");
    }
  }

  // Create a new contribution
  async create(data: {
    banglishText: string;
    banglaText: string;
    userId: string;
  }): Promise<Contribution> {
    try {
      // Check for duplicate contributions
      const existingContribution = await this.prisma.contribution.findFirst({
        where: {
          banglishText: data.banglishText,
          banglaText: data.banglaText,
        },
      });

      if (existingContribution) {
        throw new AppError(
          "duplicate-contribution",
          "This translation has already been contributed.",
          400,
        );
      }

      // Create the contribution
      return await this.prisma.contribution.create({
        data: {
          banglishText: data.banglishText,
          banglaText: data.banglaText,
          userId: data.userId,
          isApproved: false,
        },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to create contribution");
    }
  }

  // Update contribution approval status
  async updateApprovalStatus(
    id: string,
    isApproved: boolean,
  ): Promise<Contribution> {
    try {
      return await this.prisma.contribution.update({
        where: { id },
        data: { isApproved },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to update contribution status");
    }
  }

  // Delete a contribution
  async delete(id: string, userId: string): Promise<Contribution> {
    try {
      // First, check if the user has permission to delete
      const contribution = await this.prisma.contribution.findUnique({
        where: { id },
      });

      if (!contribution || contribution.userId !== userId) {
        throw new AppError(
          "unauthorized-delete",
          "You are not authorized to delete this contribution.",
          403,
        );
      }

      // Perform deletion
      return await this.prisma.contribution.delete({
        where: { id },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to delete contribution");
    }
  }

  // Update a contribution
  async update(
    id: string,
    data: {
      banglishText?: string;
      banglaText?: string;
    },
  ): Promise<Contribution> {
    try {
      return await this.prisma.contribution.update({
        where: { id },
        data: {
          ...(data.banglishText && { banglishText: data.banglishText }),
          ...(data.banglaText && { banglaText: data.banglaText }),
          // Reset approval when updated
          isApproved: false,
        },
      });
    } catch (error) {
      throw this.handleError(error, "Failed to update contribution");
    }
  }

  // Helper method to handle errors consistently
  private handleError(error: unknown, message: string): AppError {
    if (error instanceof AppError) {
      return error;
    } else {
      return new AppError(
        "database-error",
        `${message}: ${
          error instanceof Error ? error.message : "Unexpected error"
        }`,
        500,
      );
    }
  }
}

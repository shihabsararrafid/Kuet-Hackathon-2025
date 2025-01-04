import { verify } from "jsonwebtoken";
import { $Enums, PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";

import { AppError } from "../../libraries/error-handling/AppError";

import { z } from "zod";
import { BaseRepository } from "../../domains/repositories/base.repository";
import { loginSchema } from "../interfaces/auth.interface";

type ILogin = z.infer<typeof loginSchema>;
enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}
export interface VerifyEmailPayload {
  email: string;
  username: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  id: string;
}

export default class AuthRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  getAll(): Promise<Partial<User>[]> {
    throw new Error("Method not implemented.");
  }
  getById(id: string): Promise<Partial<User> | null> {
    throw new Error("Method not implemented.");
  }
  async create(data: {
    role?: $Enums.Role;
    email: string;
    password: string;
  }): Promise<Partial<User>> {
    // generate salt and hashed password

    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(data.password, salt);
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (user)
        throw new AppError(
          "database-error",
          "User already Exists with the email",
          409,
        );
      return this.prisma.user.create({
        data: { ...data, salt, password: hashed },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to create new user: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  async login(data: ILogin): Promise<Partial<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (!user) {
        throw new AppError("auth-error", "User not found", 404);
      }
      if (!user.isActive) {
        throw new AppError(
          "auth-error",
          "You are an inactive user . Contact with administration",
          403,
        );
      }

      const isChecked = await bcrypt.compare(data.password, user.password);
      if (!isChecked) {
        throw new AppError("auth-error", "You are unauthorized", 401);
      }
      // delete user.password
      const { password, ...response } = user;
      return response;
      // console.log(isChecked);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to create new user: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  async verifyEmail(data: VerifyEmailPayload): Promise<Partial<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: data.id,
          email: data.email,
        },
      });
      if (!user) {
        throw new AppError("auth-error", "User not found", 404);
      }
      if (user.isEmailVerified) {
        throw new AppError("verification-error", "Email Already Verified", 409);
      }

      const result = await this.prisma.user.update({
        where: {
          id: data.id,
          email: data.email,
        },
        data: {
          isEmailVerified: true,
          isActive: true,
        },
      });
      // delete user.password
      const { password, ...response } = result;
      return response;
      // console.log(isChecked);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to create new user: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  } // Get user profile
  async getProfile(id: string): Promise<Partial<any>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          _count: {
            select: {
              transaltions: true,
              contributions: true,
              chats: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError("user-not-found", "User not found", 404);
      }

      return {
        ...user,
        translationsCount: user._count.transaltions,
        contributionsCount: user._count.contributions,
        chatsCount: user._count.chats,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to create new user: ${
            error instanceof Error ? error.message : "Unexpected error"
          }`,
          500,
        );
      }
    }
  }
  async getOtherUserProfile(id: string): Promise<Partial<any>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, isProfilePublic: true },
        include: {
          transaltions: {
            where: {
              visibility: "PUBLIC",
            },
          },
        },
      });

      if (!user) {
        throw new AppError("user-not-found", "User not found", 404);
      }

      return {
        ...user,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "database-error",
          `Failed to create new user: ${
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

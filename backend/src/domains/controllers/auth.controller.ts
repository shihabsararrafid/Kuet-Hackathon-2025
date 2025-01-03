import { NextFunction, Request, Response } from "express";
import { BaseController } from "../../domains/controllers/base.controller";
import { AppError } from "../../libraries/error-handling/AppError";
import React from "react";
import { JwtService } from "../../domains/services/auth/jwt.service";
import { AuthCookie } from "../../domains/services/auth/auth.cookie";
import config from "../../configs";

import AuthRepository, {
  VerifyEmailPayload,
} from "../repositories/auth.respository";
// import EmailService from "../services/email.service";
import { render } from "@react-email/components";
export default class AuthController extends BaseController {
  private authRepository: AuthRepository;
  // private emailService: EmailService;
  private jwtService: JwtService;
  constructor(
    authRepository: AuthRepository,
    // emailService: EmailService,
    jwtService: JwtService,
  ) {
    super();
    this.authRepository = authRepository;
    // this.emailService = emailService;
    this.jwtService = jwtService;
  }
  async registerUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.authRepository.create(req.body);
      this.sendSuccessResponse(res, user);
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async loginUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.authRepository.login(req.body);
      const token = await this.jwtService.generateTokenPair({
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        id: user.id,
      });

      AuthCookie.setAuthCookies(res, token.accessToken, token.refreshToken);

      this.sendSuccessResponse(res, {
        ...user,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      });
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async logoutUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      AuthCookie.removeAuthCookies(res);
      this.sendSuccessResponse(res, "User Logged Out");
    } catch (error) {
      if (error instanceof AppError) {
        this.sendErrorResponse(res, error);
      } else {
        next(error);
      }
    }
  }
  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, token } = req.query;
      if (!email || !token) {
        throw new AppError("Error", "Email and Token Both Needed", 422);
      }
      const payload = await this.jwtService.verifyToken(token as string);
      const user = await this.authRepository.verifyEmail(
        payload as VerifyEmailPayload,
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

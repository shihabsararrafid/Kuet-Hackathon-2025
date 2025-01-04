import express from "express";
import fs from "fs";
import { join } from "path";
import prisma from "../../libraries/db/prisma";
import { checkAuth } from "../../middlewares/auth/checkAuth";
import { validateRequest } from "../../middlewares/request-validate";
import AuthController from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../interfaces/auth.interface";
import AuthRepository from "../repositories/auth.respository";
import { JwtService } from "../services/auth/jwt.service";
const privateKeyFile = join(process.cwd(), "secretKeys/tokenECPrivate.pem");
const publicKeyPath = join(process.cwd(), "secretKeys/tokenECPublic.pem");
const privateKey = fs.readFileSync(privateKeyFile, "utf-8");
const publicKey = fs.readFileSync(publicKeyPath, "utf-8");
const router = express.Router();
const authRepository = new AuthRepository(prisma);
// const emailService = new EmailService();
const jwtService = new JwtService(privateKey, publicKey);
const authController = new AuthController(
  authRepository,
  //   emailService,
  jwtService,
);

router.post(
  "/register",
  validateRequest({ schema: registerSchema }),
  (req, res, next) => authController.registerUser(req, res, next),
);
router.post(
  "/login",
  validateRequest({ schema: loginSchema }),
  (req, res, next) => authController.loginUser(req, res, next),
);
router.post("/logout", (req, res, next) =>
  authController.logoutUser(req, res, next),
);
router.get("/profile", checkAuth(), (req, res, next) =>
  authController.getUserProfile(req, res, next),
);
router.get("/user/profile/:id", (req, res, next) =>
  authController.getUserProfile(req, res, next),
);
export default router;

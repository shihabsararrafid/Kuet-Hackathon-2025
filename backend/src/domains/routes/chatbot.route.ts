import express from "express";
import prisma from "../../libraries/db/prisma";
import { checkAuth } from "../../middlewares/auth/checkAuth";
import ChatbotController from "../controllers/chatbot.controller";
import ChatbotRepository from "../repositories/chatbot.repositories";
const router = express.Router();
const chatbotRepository = new ChatbotRepository(prisma);
const chatbotController = new ChatbotController(chatbotRepository);

router.post(
  "/",
  checkAuth(),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => chatbotController.translateText(req, res, next),
);
router.post(
  "/:chatId",
  checkAuth(),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => chatbotController.addMessageToText(req, res, next),
);
export default router;

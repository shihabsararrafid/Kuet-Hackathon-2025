import express from "express";
import prisma from "../../libraries/db/prisma";
import TranslationController from "../controllers/translate.controller";
import TranslationRepository from "../repositories/translate.repositories";
const router = express.Router();
const translationRepository = new TranslationRepository(prisma);
const translationController = new TranslationController(translationRepository);

router.post(
  "/",
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => translationController.translateText(req, res, next),
);
router.post(
  "/generate-pdf/:id",
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => translationController.generatePdf(req, res, next),
);

export default router;

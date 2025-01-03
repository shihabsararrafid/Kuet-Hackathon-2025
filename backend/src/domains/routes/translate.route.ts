import express from "express";
import prisma from "../../libraries/db/prisma";
import TranslationController from "../controllers/translate.controller";
import TranslationRepository from "../repositories/translate.repositories";
import { checkAuth } from "../../middlewares/auth/checkAuth";
const router = express.Router();
const translationRepository = new TranslationRepository(prisma);
const translationController = new TranslationController(translationRepository);

router.post(
  "/",
  checkAuth(["USER"]),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => translationController.translateText(req, res, next),
);
router.get(
  "/",
  checkAuth(["USER"]),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => translationController.getTranslations(req, res, next),
);
router.get(
  "/all-pdfs",
  checkAuth(["USER"]),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) =>
    translationController.getPublicTranslations(req, res, next),
);
router.post(
  "/generate-pdf/:id",
  checkAuth(["USER"]),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) => translationController.generatePdf(req, res, next),
);
router.patch(
  "/shareability/:id",
  checkAuth(["USER"]),
  //   validateRequest({ schema: registerSchema }),
  (req, res, next) =>
    translationController.updatePDFShareability(req, res, next),
);

export default router;

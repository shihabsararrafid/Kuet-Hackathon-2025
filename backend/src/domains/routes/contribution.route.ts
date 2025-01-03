import { Router } from "express";
import ContributionController from "../controllers/contribution.controller";
import ContributionRepository from "../repositories/contribution.repositories";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "../../middlewares/auth/checkAuth";

const prisma = new PrismaClient();
const contributionRepository = new ContributionRepository(prisma);
const contributionController = new ContributionController(
  contributionRepository,
);

const router = Router();

// Create a new contribution (authenticated users)
router.post("/create", checkAuth(["USER"]), (req, res, next) =>
  contributionController.createContribution(req, res, next),
);

// Get user's own contributions (authenticated users)
router.get("/my-contributions", checkAuth(["USER"]), (req, res, next) =>
  contributionController.getUserContributions(req, res, next),
);

// Get all contributions (admin only)
router.get("/all", checkAuth(["ADMIN"]), (req, res, next) =>
  contributionController.getAllContributions(req, res, next),
);

// Get a specific contribution by ID
router.get("/:id", checkAuth(["USER"]), (req, res, next) =>
  contributionController.getContributionById(req, res, next),
);

// Update a contribution
router.put("/:id", checkAuth(["USER"]), (req, res, next) =>
  contributionController.updateContribution(req, res, next),
);

// Update contribution approval status (admin only)
router.patch(
  "/:id/approval",
  checkAuth(["ADMIN"]),

  (req, res, next) =>
    contributionController.updateApprovalStatus(req, res, next),
);

// Delete a contribution
router.delete("/:id", checkAuth(["ADMIN"]), (req, res, next) =>
  contributionController.deleteContribution(req, res, next),
);

export default router;

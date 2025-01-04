import { logger } from "./libraries/log/logger";
import express, { Express } from "express";
import path from "path";
import domainRoutes from "./domains/routes/index";
import { checkPdfAccess } from "./middlewares/pdf/checkPdfAccess";
import { checkAuth } from "./middlewares/auth/checkAuth";
export function defineRoutes(expressApp: Express) {
  logger.info("Defining routes...");
  const router = express.Router();

  domainRoutes(router);
  expressApp.use(
    "/files",
    checkAuth([], false),
    checkPdfAccess,
    express.static(path.resolve("data/pdf")),
  );
  expressApp.use("/api/v1", router);
  // health check
  expressApp.get("/health", (req, res) => {
    res.status(200).send("OK");
  });
  // 404 handler
  expressApp.use((req, res) => {
    res.status(404).send("Not Found");
  });
  logger.info("Routes defined");
}

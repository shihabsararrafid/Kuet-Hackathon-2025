import { Router } from "express";
import authRoutes from "./auth.route";
import translationsRoute from "./translate.route";
import chatBotRoute from "./chatbot.route";
import contributionRoute from "./contribution.route";
const defineRoutes = async (expressRouter: Router) => {
  expressRouter.use("/auth", authRoutes);
  expressRouter.use("/translations", translationsRoute);
  expressRouter.use("/chatbot", chatBotRoute);
  expressRouter.use("/contribution", contributionRoute);
};

export default defineRoutes;

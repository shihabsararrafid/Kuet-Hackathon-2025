import { Router } from "express";
import authRoutes from "./auth.route";
import translationsRoute from "./translate.route";
import chatBotRoute from "./chatbot.route";
const defineRoutes = async (expressRouter: Router) => {
  expressRouter.use("/auth", authRoutes);
  expressRouter.use("/translations", translationsRoute);
  expressRouter.use("/chatbot", chatBotRoute);
};

export default defineRoutes;

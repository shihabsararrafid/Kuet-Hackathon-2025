import { Router } from "express";
import authRoutes from "./auth.route";
import translationsRoute from "./translate.route";
const defineRoutes = async (expressRouter: Router) => {
  expressRouter.use("/auth", authRoutes);
  expressRouter.use("/translations", translationsRoute);
};

export default defineRoutes;

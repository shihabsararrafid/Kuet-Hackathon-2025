import { Router } from "express";
import authRoutes from "./auth.route";

const defineRoutes = async (expressRouter: Router) => {
  expressRouter.use("/auth", authRoutes);
};

export default defineRoutes;

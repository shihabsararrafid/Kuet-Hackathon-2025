import { NextFunction, Request, Response } from "express";
import { AppError } from "../../libraries/error-handling/AppError";
import { JwtService } from "./../../domains/services/auth/jwt.service";
import fs from "fs";
import { join } from "path";
import { AuthCookie } from "../../domains/services/auth/auth.cookie";
import { AuthPayload } from "../../domains/interfaces/auth.interface";
const privateKeyFile = join(process.cwd(), "secretKeys/tokenECPrivate.pem");
const publicKeyPath = join(process.cwd(), "secretKeys/tokenECPublic.pem");
const privateKey = fs.readFileSync(privateKeyFile, "utf-8");
const publicKey = fs.readFileSync(publicKeyPath, "utf-8");
const jwtService = new JwtService(privateKey, publicKey);
export const checkAuth = (types?: string[], required = true) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(req);
      const token =
        req.signedCookies.access_token ??
        req.cookies.access_token ??
        req.header("authentication")?.split(" ")[1];
      // console.log(token, "token");
      if (!token && !required) {
        req.user = null;
        return next();
      }
      if (!token) throw new AppError("Auth-error", "You Are Unauthorized", 401);

      const payload = (await jwtService.verifyToken(token)) as AuthPayload;
      req.user = payload;
      // console.log("hjer");
      // Check role access if types are specified
      if (types?.length && required) {
        const hasAccess = types.includes(payload.role);
        if (!hasAccess) {
          throw new AppError("Auth-error", "Forbidden access", 403);
        }
      }
      return next();
    } catch (error) {
      console.log(console.error(error));
      if (error instanceof Error && error.message === "Token has expired") {
        const refresh_token =
          req.signedCookies.refresh_token ?? req.cookies.refresh_token;
        if (!refresh_token)
          throw new AppError("Token Not Found", "No Refresh token found", 401);
        try {
          const t = await jwtService.refreshAccessToken(refresh_token);
          AuthCookie.setAuthCookies(res, t.accessToken, t.refreshToken);
          res.cookie("access_token", t.accessToken, { path: "/" });
          res.cookie("refresh_token", t.refreshToken, { path: "/" });
          const decoded = (await jwtService.verifyToken(
            t.accessToken,
          )) as AuthPayload;

          req.user = decoded;

          // Check role access if types are specified
          if (types?.length && required) {
            const hasAccess = types.includes(decoded.role);
            if (!hasAccess) {
              throw new AppError("Auth-error", "Forbidden access", 403);
            }
          }
          //   console.log("New Token Assigned", decoded);
          next();
        } catch (error) {
          next(error);
        }
      } else {
        next(error);
      }
      //   console.error(error.message);
      //   next(error);
    }
  };
};

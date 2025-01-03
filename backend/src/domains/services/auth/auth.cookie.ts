import { CookieOptions, Response } from "express";
import config from "../../../configs";

const isDevelopment = config.NODE_ENV === "development";
// Common cookie options
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access
  sameSite: "None", //isDevelopment ? "lax" : "strict", // CSRF protection
  secure: true, // false in development, true in production  // Only sent over HTTPS
  signed: true,
};
export const AuthCookie = {
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    // Access token in memory-only cookie
    // Short lived (15-60 minutes typically)

    res.cookie("access_token", accessToken, {
      ...(cookieOptions as CookieOptions),
      maxAge: 900000, // 15 minutes
      path: "/",
      // signed: true,
    });
    // console.log(r);
    // Refresh token in HTTP-only cookie
    // Longer lived (days/weeks)
    res.cookie("refresh_token", refreshToken, {
      ...(cookieOptions as CookieOptions),
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      path: "/api/v1", // Restricted path
      signed: true,
    });
  },
  removeAuthCookies(res: Response) {
    res.clearCookie("access_token", {
      ...(cookieOptions as CookieOptions),
      path: "/", // Must match the path used when setting
    });

    // Clear refresh token
    res.clearCookie("refresh_token", {
      ...(cookieOptions as CookieOptions),
      path: "/api/v1/auth/refresh", // Restricted path
    });
  },
};

import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import { createPrivateKey, KeyObject } from "node:crypto";
import config from "../../../configs";
import { InvalidTokenError, TokenExpiredError } from "./auth.error";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export class JwtService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly decryptedPrivateKey: KeyObject;

  // Development configuration
  private readonly isDevelopment = config.NODE_ENV === "development";

  constructor(privateKey: string, publicKey: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.decryptedPrivateKey = createPrivateKey({
      key: this.privateKey,
      passphrase: "top secret",
    });
  }
  /**
   * Generate token pair
   * @param userData
   * @returns Promise<TokenPair> generated accessToken and refreshToken
   */
  async generateTokenPair(userData: object): Promise<TokenPair> {
    const accessToken = await this.generateToken(
      { ...userData, type: "access" },
      { expiresIn: "3h" }
    );
    const refreshToken = await this.generateToken(
      { ...userData, type: "refresh" },
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      refreshToken,
    };
  }
  /**
   * Generate a JWT token
   * @param payload The data to be encoded in the token
   * @param options JWT sign options
   * @returns Promise<string> The generated token
   */
  async generateToken(
    payload: object,
    options: SignOptions = {}
  ): Promise<string> {
    const defaultOptions: SignOptions = {
      algorithm: "RS256",
      expiresIn: "24h",
      ...options,
    };

    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.decryptedPrivateKey,
        defaultOptions,
        (error, token) => {
          if (error) {
            reject(error);
          } else if (token) {
            resolve(token);
          } else {
            reject(new Error("Token generation failed"));
          }
        }
      );
    });
  }

  /**
   * Verify any token with specific options
   */
  async verifyToken(
    token: string,
    secret = this.publicKey,
    options: VerifyOptions = {}
  ): Promise<object> {
    const defaultOptions: VerifyOptions = {
      algorithms: ["RS256"],
      ...options,
    };

    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, defaultOptions, (error, decoded) => {
        if (error) {
          if (error.name === "TokenExpiredError") {
            reject(new TokenExpiredError());
          } else {
            reject(new InvalidTokenError(error.message));
          }
        } else if (decoded && typeof decoded !== "string") {
          // Verify the token type and other expected payload values
          const payload = decoded as object;

          resolve(payload);
        } else {
          reject(new InvalidTokenError("Invalid token format"));
        }
      });
    });
  }

  /**
   * Decode a JWT token without verifying it
   * @param token The JWT token to decode
   * @returns JwtPayload | null The decoded token payload
   */
  decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload;
  }

  /**
   * Check if a token is expired
   * @param token The JWT token to check
   * @returns boolean True if the token is expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  }

  /**
   * Refresh a token by generating a new one with the same payload
   * @param oldToken The token to refresh
   * @param options JWT sign options for the new token
   * @returns Promise<string> The new token
   */
  async refreshToken(
    oldToken: string,
    options: SignOptions = {}
  ): Promise<string> {
    try {
      const decoded = await this.verifyToken(oldToken, this.publicKey);
      const { iat, exp, ...payload } = decoded as JwtPayload;
      return this.generateToken(payload as object, options);
    } catch (error) {
      throw new Error("Invalid token for refresh");
    }
  }
  /**
   * Verify an access token
   */
  async verifyAccessToken(token: string): Promise<object> {
    return this.verifyToken(token, this.publicKey);
  }

  /**
   * Verify a refresh token
   */
  async verifyRefreshToken(token: string): Promise<object> {
    return this.verifyToken(token, this.publicKey);
  }

  /**
   * Refresh an access token using a valid refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      const { jti, iat, exp, type, ...userData } = payload as JwtPayload;

      // Generate new token pair
      return this.generateTokenPair(userData);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenExpiredError("Refresh token has expired");
      }
      throw new InvalidTokenError("Invalid refresh token");
    }
  }
}

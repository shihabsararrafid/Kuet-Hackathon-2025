import fs from "fs";
import { JwtPayload, sign, verify } from "jsonwebtoken";

const privateKey = fs.readFileSync("secretKeys/tokenECPrivate.pem", "utf-8");
const publicKey = fs.readFileSync("secretKeys/tokenECPublic.pem", "utf-8");
// Make a token
export const signToken = (payload: object, expireTime = 604800) => {
  // Return Promise
  return new Promise<string | undefined>((resolve, reject) => {
    // Sign the payload with json web token
    sign(
      payload,
      privateKey,
      { algorithm: "RS256", expiresIn: expireTime },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};

// Verify Token
export const verifyToken = (token: string) => {
  // Return Promise
  return new Promise<JwtPayload>((resolve, reject) => {
    // Verify json web token
    verify(token, publicKey, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload as JwtPayload);
      }
    });
  });
};

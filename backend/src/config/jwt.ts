import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface JwtPayload {
  userId: string;
  role: string;
}

export function generateAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

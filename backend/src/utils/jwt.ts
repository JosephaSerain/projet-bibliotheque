import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  userId: number;
};

export function signToken(payload: JwtPayload): string {
  // @types/jsonwebtoken requires a branded duration string (e.g. "7d"), not a plain
  // string, for expiresIn — cast since our value comes from a validated env var.
  const options: jwt.SignOptions = { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
import { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../utils/authCookie";
import { verifyToken } from "../utils/jwt";
import { HttpError } from "./errorHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies[AUTH_COOKIE_NAME];
  if (!token) {
    return next(new HttpError(401, "Not authenticated"));
  }

  try {
    req.userId = verifyToken(token).userId;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired session"));
  }
}

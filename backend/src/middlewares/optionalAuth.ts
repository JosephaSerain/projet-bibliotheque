import { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../utils/authCookie";
import { verifyToken } from "../utils/jwt";

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies[AUTH_COOKIE_NAME];
  if (token) {
    try {
      req.userId = verifyToken(token).userId;
    } catch {
      // Token invalide/expiré : on continue simplement sans utilisateur authentifié,
      // contrairement à requireAuth qui rejetterait la requête.
    }
  }
  next();
}

import { Response } from "express";
import { env } from "../config/env";

export const AUTH_COOKIE_NAME = "token";

const DURATION_UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function parseDurationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid duration format: "${value}" (expected e.g. "7d", "12h")`);
  }
  const [, amount, unit] = match;
  return Number(amount) * DURATION_UNIT_TO_MS[unit];
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: parseDurationToMs(env.jwtExpiresIn),
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
}
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response } from "express";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/errorHandler";
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "../schemas/auth.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie";
import { signToken } from "../utils/jwt";

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

// Ne jamais renvoyer motDePasseHash (ni le reste des champs sensibles) au client.
function toPublicUser(user: {
  id: number;
  email: string;
  pseudo: string;
  avatarUrl: string | null;
  dateInscription: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    avatarUrl: user.avatarUrl,
    dateInscription: user.dateInscription,
  };
}

export const register = asyncHandler(async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
  const { email, motDePasse, pseudo } = req.body;

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "Un compte existe déjà avec cet email");
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
  const user = await prisma.utilisateur.create({
    data: { email, motDePasseHash, pseudo },
  });

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);
  res.status(201).json(toPublicUser(user));
});

export const login = asyncHandler(async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
  const { email, motDePasse } = req.body;

  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(motDePasse, user.motDePasseHash))) {
    throw new HttpError(401, "Email ou mot de passe incorrect");
  }

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);
  res.json(toPublicUser(user));
});

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(204).send();
}

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.utilisateur.findUnique({ where: { id: req.userId } });
  if (!user) {
    throw new HttpError(404, "Utilisateur introuvable");
  }
  res.json(toPublicUser(user));
});

export const updateMe = asyncHandler(async (req: Request<unknown, unknown, UpdateProfileInput>, res: Response) => {
  const { pseudo, avatarUrl, email } = req.body;

  if (email) {
    const existing = await prisma.utilisateur.findUnique({ where: { email } });
    if (existing && existing.id !== req.userId) {
      throw new HttpError(409, "Cet email est déjà utilisé par un autre compte");
    }
  }

  const user = await prisma.utilisateur.update({
    where: { id: req.userId },
    data: { pseudo, avatarUrl, email },
  });

  res.json(toPublicUser(user));
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  await prisma.utilisateur.delete({ where: { id: req.userId } });
  clearAuthCookie(res);
  res.status(204).send();
});

export const forgotPassword = asyncHandler(
  async (req: Request<unknown, unknown, ForgotPasswordInput>, res: Response) => {
    const { email } = req.body;

    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.utilisateur.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      });
      const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;
      console.log(`[reset-password] Lien pour ${email} : ${resetLink}`);
    }

    // Même réponse que l'email existe ou non, pour ne pas révéler quels comptes sont inscrits.
    res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request<unknown, unknown, ResetPasswordInput>, res: Response) => {
    const { token, motDePasse } = req.body;

    const user = await prisma.utilisateur.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new HttpError(400, "Lien de réinitialisation invalide ou expiré");
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { motDePasseHash, resetToken: null, resetTokenExpiresAt: null },
    });

    res.json({ message: "Mot de passe mis à jour." });
  },
);
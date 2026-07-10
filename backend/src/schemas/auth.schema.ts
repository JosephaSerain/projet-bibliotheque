import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  pseudo: z.string().min(2).max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

export const updateProfileSchema = z
  .object({
    pseudo: z.string().min(2).max(50).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Aucune donnée à mettre à jour" });

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
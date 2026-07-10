"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <main className="auth-page">
        <h1 className="auth-title">Lien invalide</h1>
        <p className="auth-sub">Ce lien de réinitialisation est incomplet ou a expiré.</p>
        <p className="auth-switch">
          <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
        </p>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (motDePasse !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, motDePasse }),
      });
      toast.success("Mot de passe mis à jour, tu peux te reconnecter");
      router.push("/connexion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1 className="auth-title">Nouveau mot de passe</h1>
      <p className="auth-sub">Choisis un nouveau mot de passe pour ton compte.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="reset-password">Nouveau mot de passe</label>
          <input
            id="reset-password"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="form-field">
          <label htmlFor="reset-password-confirm">Confirmer le mot de passe</label>
          <input
            id="reset-password-confirm"
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </main>
  );
}
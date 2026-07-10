"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const { message } = await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success(message);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1 className="auth-title">Mot de passe oublié</h1>
      <p className="auth-sub">On t&apos;enverra un lien pour en choisir un nouveau.</p>

      {sent ? (
        <p className="form-success">
          Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      )}

      <p className="auth-switch">
        <Link href="/connexion">Retour à la connexion</Link>
      </p>
    </main>
  );
}
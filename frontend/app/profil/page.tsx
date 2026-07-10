"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";
import { User, useAuth } from "../../lib/auth-context";

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();

  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Route privée : une fois qu'on sait qu'il n'y a pas d'utilisateur connecté, on redirige.
  useEffect(() => {
    if (!loading && !user) {
      router.push("/connexion");
    }
  }, [loading, user, router]);

  // Pré-remplit le formulaire quand l'utilisateur est chargé.
  useEffect(() => {
    if (user) {
      setPseudo(user.pseudo);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? "");
    }
  }, [user]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const updated = await apiFetch<User>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          pseudo,
          email,
          avatarUrl: avatarUrl.trim() === "" ? null : avatarUrl,
        }),
      });
      setUser(updated);
      toast.success("Profil mis à jour");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch("/auth/me", { method: "DELETE" });
      setUser(null);
      toast.success("Compte supprimé");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
      setDeleting(false);
    }
  }

  // Pendant le chargement initial (ou juste avant la redirection), on n'affiche rien
  // plutôt qu'un flash de formulaire vide.
  if (loading || !user) {
    return null;
  }

  return (
    <main className="profil-page">
      <div className="profil-grid">
        <section className="panel profil-card">
          <div className="profil-header">
            {avatarUrl && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar vient d'une URL externe arbitraire
              <img src={avatarUrl} alt="" className="profil-avatar" onError={() => setAvatarError(true)} />
            ) : (
              <div className="profil-avatar-placeholder">
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
            <div>
              <p className="profil-name">{user.pseudo}</p>
              <p className="profil-since">Membre depuis le {new Date(user.dateInscription).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="profil-pseudo">Pseudo</label>
              <input
                id="profil-pseudo"
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                autoComplete="nickname"
              />
            </div>

            <div className="form-field">
              <label htmlFor="profil-email">Email</label>
              <input
                id="profil-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <label htmlFor="profil-avatar">URL de l&apos;avatar</label>
              <input
                id="profil-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>

          <div className="danger-zone">
            <p className="danger-zone-title">Zone dangereuse</p>

            {!confirmingDelete ? (
              <button type="button" className="btn-danger" onClick={() => setConfirmingDelete(true)}>
                Supprimer mon compte
              </button>
            ) : (
              <>
                <p className="danger-warning">
                  Cette action est irréversible : ta bibliothèque, tes avis et tes notes seront définitivement
                  supprimés.
                </p>
                <div className="danger-actions">
                  <button type="button" className="btn-danger-confirm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Suppression..." : "Confirmer la suppression"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <div className="profil-side">
          <section className="panel">
            <p className="panel-title">Mes statistiques</p>
            <div className="stats-preview-grid">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Lus</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">En cours</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Abandonnés</span>
              </div>
            </div>
            <button type="button" className="btn-secondary" disabled title="À venir">
              Voir mes statistiques
            </button>
          </section>

          <section className="panel">
            <p className="panel-title">Livre en cours</p>
            <p className="empty-state">Aucun livre en cours pour l&apos;instant.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
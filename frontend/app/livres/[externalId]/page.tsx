"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../../lib/api";
import { addStatut, removeFromLibrary, removeStatut, updateBibliotheque } from "../../../lib/bibliotheque";
import { useAuth } from "../../../lib/auth-context";
import { STATUT_COLOR_VAR, STATUT_LABELS, StatutLecture } from "../../../lib/statuts";
import { LivreDetail } from "../../../lib/types";
import { Modal } from "../../components/Modal";

const ALL_STATUTS: StatutLecture[] = ["A_LIRE", "EN_COURS", "LU", "ABANDONNE"];

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export default function LivreDetailPage({ params }: { params: { externalId: string } }) {
  const router = useRouter();
  const { user } = useAuth();

  const [livre, setLivre] = useState<LivreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState(false);

  const [statuts, setStatuts] = useState<StatutLecture[]>([]);
  const [togglingStatut, setTogglingStatut] = useState<StatutLecture | null>(null);

  const [dateDebutLecture, setDateDebutLecture] = useState("");
  const [dateFinLecture, setDateFinLecture] = useState("");
  const [pageActuelle, setPageActuelle] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<LivreDetail>(`/livres/${params.externalId}`)
      .then((data) => {
        if (cancelled) return;
        setLivre(data);
        setStatuts(data.statuts as StatutLecture[]);
        setDateDebutLecture(toDateInputValue(data.dateDebutLecture));
        setDateFinLecture(toDateInputValue(data.dateFinLecture));
        setPageActuelle(data.pageActuelle != null ? String(data.pageActuelle) : "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Livre introuvable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.externalId]);

  async function toggleStatut(livreId: number, statut: StatutLecture) {
    setTogglingStatut(statut);
    try {
      const isActive = statuts.includes(statut);
      const result = isActive ? await removeStatut(livreId, statut) : await addStatut(livreId, statut);
      setStatuts(result.statuts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setTogglingStatut(null);
    }
  }

  async function handleSaveProgress(livreId: number, event: FormEvent) {
    event.preventDefault();
    setSavingProgress(true);
    try {
      const updated = await updateBibliotheque(livreId, {
        dateDebutLecture: dateDebutLecture || null,
        dateFinLecture: dateFinLecture || null,
        pageActuelle: pageActuelle === "" ? null : Number(pageActuelle),
      });
      setStatuts(updated.statuts);
      setDateDebutLecture(toDateInputValue(updated.dateDebutLecture));
      setDateFinLecture(toDateInputValue(updated.dateFinLecture));
      setPageActuelle(updated.pageActuelle != null ? String(updated.pageActuelle) : "");
      toast.success("Progression mise à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleRemove(livreId: number) {
    setRemoving(true);
    try {
      await removeFromLibrary(livreId);
      setStatuts([]);
      setDateDebutLecture("");
      setDateFinLecture("");
      setPageActuelle("");
      setConfirmingRemove(false);
      toast.success("Retiré de ta bibliothèque");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <main className="livre-page">
        <p className="empty-state">Chargement...</p>
      </main>
    );
  }

  if (error || !livre) {
    return (
      <main className="livre-page">
        <button type="button" className="back-link" onClick={() => router.back()}>
          ← Retour
        </button>
        <p className="empty-state">{error ?? "Livre introuvable"}</p>
      </main>
    );
  }

  return (
    <main className="livre-page">
      <button type="button" className="back-link" onClick={() => router.back()}>
        ← Retour
      </button>

      <div className="livre-hero">
        <div className="livre-cover">
          {livre.couvertureUrl && !coverError ? (
            // eslint-disable-next-line @next/next/no-img-element -- couverture vient d'une URL Google Books arbitraire
            <img src={livre.couvertureUrl} alt="" onError={() => setCoverError(true)} />
          ) : (
            <span className="livre-cover-fallback">{livre.titre}</span>
          )}
        </div>

        <div className="livre-info">
          <h1 className="livre-title">{livre.titre}</h1>
          <p className="livre-auteurs">{livre.auteurs.join(", ") || "Auteur inconnu"}</p>

          <div className="livre-meta">
            {livre.nombrePages && <span>{livre.nombrePages} pages</span>}
            {livre.editeur && <span>{livre.editeur}</span>}
            {livre.datePublication && <span>{new Date(livre.datePublication).getFullYear()}</span>}
          </div>

          {livre.genres.length > 0 && (
            <div className="livre-tags">
              {livre.genres.map((genre) => (
                <span key={genre} className="tag">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="livre-bibliotheque">
        <p className="livre-section-title">Ma bibliothèque</p>

        {!user && <p className="empty-state">Connecte-toi pour ajouter ce livre à ta bibliothèque.</p>}

        {user && (
          <>
            <div className="filters">
              {ALL_STATUTS.map((statut) => {
                const on = statuts.includes(statut);
                return (
                  <button
                    key={statut}
                    type="button"
                    className={on ? "filter on" : "filter"}
                    style={on ? { background: STATUT_COLOR_VAR[statut] } : undefined}
                    onClick={() => toggleStatut(livre.id, statut)}
                    disabled={togglingStatut === statut}
                    aria-pressed={on}
                  >
                    <span className="dot" style={{ background: STATUT_COLOR_VAR[statut] }} />
                    {STATUT_LABELS[statut]}
                  </button>
                );
              })}
            </div>

            {statuts.length > 0 && (
              <>
                <form className="livre-progress-form" onSubmit={(e) => handleSaveProgress(livre.id, e)}>
                  <div className="livre-progress-fields">
                    <div className="form-field">
                      <label htmlFor="date-debut">Date de début</label>
                      <input
                        id="date-debut"
                        type="date"
                        value={dateDebutLecture}
                        onChange={(e) => setDateDebutLecture(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="date-fin">Date de fin</label>
                      <input
                        id="date-fin"
                        type="date"
                        value={dateFinLecture}
                        onChange={(e) => setDateFinLecture(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="page-actuelle">Page actuelle</label>
                      <input
                        id="page-actuelle"
                        type="number"
                        min={0}
                        max={livre.nombrePages ?? undefined}
                        value={pageActuelle}
                        onChange={(e) => setPageActuelle(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={savingProgress}>
                    {savingProgress ? "Enregistrement..." : "Enregistrer la progression"}
                  </button>
                </form>

                <button type="button" className="btn-danger" onClick={() => setConfirmingRemove(true)}>
                  Retirer de ma bibliothèque
                </button>

                <Modal
                  open={confirmingRemove}
                  onClose={() => setConfirmingRemove(false)}
                  title="Retirer ce livre ?"
                >
                  <p className="danger-warning">
                    Il sera retiré de toutes tes listes, avec ta progression de lecture.
                  </p>
                  <div className="danger-actions">
                    <button
                      type="button"
                      className="btn-danger-confirm"
                      onClick={() => handleRemove(livre.id)}
                      disabled={removing}
                    >
                      {removing ? "Suppression..." : "Confirmer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setConfirmingRemove(false)}
                      disabled={removing}
                    >
                      Annuler
                    </button>
                  </div>
                </Modal>
              </>
            )}
          </>
        )}
      </section>

      {livre.description && (
        <section>
          <p className="livre-section-title">À propos</p>
          <p className="livre-description">{livre.description}</p>
        </section>
      )}
    </main>
  );
}
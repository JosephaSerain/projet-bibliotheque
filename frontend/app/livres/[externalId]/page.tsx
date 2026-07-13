"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { STATUT_COLOR_VAR, STATUT_LABELS, StatutLecture } from "../../../lib/statuts";
import { LivreDetail } from "../../../lib/types";

export default function LivreDetailPage({ params }: { params: { externalId: string } }) {
  const router = useRouter();
  const [livre, setLivre] = useState<LivreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<LivreDetail>(`/livres/${params.externalId}`)
      .then((data) => {
        if (!cancelled) setLivre(data);
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

          {livre.statuts.length > 0 && (
            <div className="livre-statuts">
              {livre.statuts.map((statut) => (
                <span
                  key={statut}
                  className="statut-badge"
                  style={{ background: STATUT_COLOR_VAR[statut as StatutLecture] }}
                >
                  Déjà dans : {STATUT_LABELS[statut as StatutLecture]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {livre.description && (
        <section>
          <p className="livre-section-title">À propos</p>
          <p className="livre-description">{livre.description}</p>
        </section>
      )}
    </main>
  );
}
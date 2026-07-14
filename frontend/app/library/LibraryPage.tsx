"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../lib/auth-context";
import { BibliothequeListEntry, listBibliotheque } from "../../lib/bibliotheque";
import { STATUT_COLOR_VAR, STATUT_LABELS, StatutLecture } from "../../lib/statuts";

const ALL_STATUTS: StatutLecture[] = ["A_LIRE", "EN_COURS", "LU", "ABANDONNE"];

export function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const initialStatut = searchParams.get("statut") as StatutLecture | null;
  const [activeStatut, setActiveStatut] = useState<StatutLecture | null>(
    initialStatut && ALL_STATUTS.includes(initialStatut) ? initialStatut : null,
  );
  const [entries, setEntries] = useState<BibliothequeListEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listBibliotheque(activeStatut ?? undefined)
      .then(setEntries)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Impossible de charger ta bibliothèque"))
      .finally(() => setLoading(false));
  }, [user, activeStatut]);

  function toggleFilter(statut: StatutLecture) {
    const next = activeStatut === statut ? null : statut;
    setActiveStatut(next);
    router.replace(next ? `/library?statut=${next}` : "/library");
  }

  if (authLoading || !user) {
    return null;
  }

  return (
    <main>
      <h1 className="page-title">Ma bibliothèque</h1>
      <p className="page-sub">
        {entries ? `${entries.length} livre${entries.length > 1 ? "s" : ""}` : ""}
      </p>

      <div className="filters">
        {ALL_STATUTS.map((statut) => {
          const on = activeStatut === statut;
          return (
            <button
              key={statut}
              type="button"
              className={on ? "filter on" : "filter"}
              style={on ? { background: STATUT_COLOR_VAR[statut] } : undefined}
              onClick={() => toggleFilter(statut)}
              aria-pressed={on}
            >
              <span className="dot" style={{ background: STATUT_COLOR_VAR[statut] }} />
              {STATUT_LABELS[statut]}
            </button>
          );
        })}
      </div>

      {loading && <p className="empty-state">Chargement...</p>}

      {!loading && entries && entries.length === 0 && (
        <p className="empty-state">
          {activeStatut ? "Aucun livre dans cette liste." : "Ta bibliothèque est vide pour l'instant."}
        </p>
      )}

      {!loading && entries && entries.length > 0 && (
        <div className="grid">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/livres/${entry.livre.idExterne}`} className="card">
              <div className="card-cover">
                {entry.livre.couvertureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- couverture vient d'une URL Google Books arbitraire
                  <img src={entry.livre.couvertureUrl} alt="" />
                ) : (
                  <span className="card-cover-fallback">{entry.livre.titre}</span>
                )}
                <div className="card-flags">
                  {entry.statuts.map((statut) => (
                    <span key={statut} className="flag-dot" style={{ background: STATUT_COLOR_VAR[statut] }} />
                  ))}
                </div>
              </div>
              <p className="card-title">{entry.livre.titre}</p>
              <p className="card-author">{entry.livre.auteurs.join(", ") || "Auteur inconnu"}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
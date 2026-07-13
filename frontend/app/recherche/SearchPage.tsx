"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";
import { LivreRecherche } from "../../lib/types";

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [lastQuery, setLastQuery] = useState(initialQuery);
  const [results, setResults] = useState<LivreRecherche[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(q: string) {
    if (q.trim() === "") {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setLastQuery(q);

    try {
      const data = await apiFetch<LivreRecherche[]>(`/livres/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "La recherche a échoué");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Recherche automatique si on arrive sur la page avec ?q=... déjà rempli.
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    router.replace(`/recherche?q=${encodeURIComponent(query)}`);
    runSearch(query);
  }

  return (
    <main className="search-page">
      <div className="search-hero">
        <h1 className="page-title">Rechercher un livre</h1>
        <p className="page-sub">Par titre, auteur ou ISBN.</p>

        <form className="search-bar" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : Fourth Wing, Rebecca Yarros, 9782755..."
            aria-label="Rechercher un livre"
          />
          <button type="submit" disabled={loading || query.trim() === ""}>
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </form>
      </div>

      {!hasSearched && <p className="empty-state">Lance une recherche pour découvrir des livres.</p>}

      {hasSearched && !loading && results?.length === 0 && (
        <p className="empty-state">Aucun résultat pour « {lastQuery} ».</p>
      )}

      {results && results.length > 0 && (
        <div className="grid">
          {results.map((book) => (
            <Link key={book.idExterne} href={`/livres/${book.idExterne}`} className="card">
              <div className="card-cover">
                {book.couvertureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- couverture vient d'une URL Google Books arbitraire
                  <img src={book.couvertureUrl} alt="" />
                ) : (
                  <span className="card-cover-fallback">{book.titre}</span>
                )}
              </div>
              <p className="card-title">{book.titre}</p>
              <p className="card-author">{book.auteurs.join(", ") || "Auteur inconnu"}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
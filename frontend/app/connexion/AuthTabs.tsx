"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type Tab = "connexion" | "inscription";

export function AuthTabs() {
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "inscription" ? "inscription" : "connexion";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <main className="auth-page">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "connexion"}
          className={tab === "connexion" ? "auth-tab active" : "auth-tab"}
          onClick={() => setTab("connexion")}
        >
          Connexion
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "inscription"}
          className={tab === "inscription" ? "auth-tab active" : "auth-tab"}
          onClick={() => setTab("inscription")}
        >
          Inscription
        </button>
      </div>

      {tab === "connexion" ? (
        <>
          <h1 className="auth-title">Content de te revoir</h1>
          <p className="auth-sub">Connecte-toi pour retrouver ta bibliothèque.</p>
          <LoginForm />
        </>
      ) : (
        <>
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-sub">Rejoins Nesta&apos;s Library pour suivre tes lectures.</p>
          <RegisterForm />
        </>
      )}
    </main>
  );
}
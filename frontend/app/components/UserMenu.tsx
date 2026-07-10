"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../lib/auth-context";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    const pseudo = user?.pseudo;
    await logout();
    toast.success(pseudo ? `À bientôt, ${pseudo} !` : "Déconnexion réussie");
    router.push("/");
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? `Menu de ${user.pseudo}` : "Menu compte"}
        onClick={() => setOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faUser} />
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          {user ? (
            <>
              <Link href="/profil" role="menuitem" onClick={() => setOpen(false)}>
                Mon profil
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" role="menuitem" onClick={() => setOpen(false)}>
                Se connecter
              </Link>
              <Link href="/connexion?tab=inscription" role="menuitem" onClick={() => setOpen(false)}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        <svg viewBox="0 0 140 116" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nesta's Library">
          <g fill="#1F2A44">
            <path d="M26,28 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 Z" />
            <path d="M70,10 l3.4,8.4 8.4,3.4 -8.4,3.4 -3.4,8.4 -3.4,-8.4 -8.4,-3.4 8.4,-3.4 Z" />
            <path d="M114,28 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 Z" />
            <rect x="16" y="76" width="108" height="13" rx="2" />
            <rect x="24" y="62" width="92" height="13" rx="2" />
            <rect x="32" y="48" width="76" height="13" rx="2" />
          </g>
          <g stroke="#FAF6ED" strokeWidth="1" opacity="0.55">
            <line x1="24" y1="82.5" x2="116" y2="82.5" />
            <line x1="32" y1="68.5" x2="108" y2="68.5" />
            <line x1="40" y1="54.5" x2="100" y2="54.5" />
          </g>
        </svg>
        Nesta&apos;s Library
      </Link>
      <div className="nav-right">
        <div className="nav-links">
          <Link href="/recherche" className={pathname === "/recherche" ? "active" : undefined}>
            Rechercher
          </Link>
          <Link href="/library" className={pathname === "/library" ? "active" : undefined}>
            Ma bibliothèque
          </Link>
          <button type="button" disabled title="À venir">
            Statistiques
          </button>
        </div>
        <UserMenu />
      </div>
    </nav>
  );
}
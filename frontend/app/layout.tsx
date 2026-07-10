import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider } from "../lib/auth-context";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nesta's Library",
  description: "Suivi de lecture personnel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
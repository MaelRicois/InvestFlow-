"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Building2 } from "lucide-react";

const marketingNav = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#pourquoi", label: "Pourquoi nous" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const isAppRoute =
    pathname === "/dashboard" ||
    pathname?.startsWith("/dashboard/") ||
    pathname === "/calculateur" ||
    pathname?.startsWith("/calculateur/") ||
    pathname === "/discover" ||
    pathname?.startsWith("/discover/");

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-stone-900 transition-opacity hover:opacity-80"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-stone-900 text-amber-400">
            <Building2 className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            InvestFlow
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex"
          aria-label="Navigation principale"
        >
          {isAppRoute ? (
            <>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-stone-900"
              >
                Dashboard
              </Link>
              <Link
                href="/discover"
                className="transition-colors hover:text-stone-900"
              >
                Découvrir
              </Link>
              <Link
                href="/calculateur"
                className="transition-colors hover:text-stone-900"
              >
                Calculateur
              </Link>
            </>
          ) : (
            marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-stone-900"
              >
                {item.label}
              </Link>
            ))
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />
          ) : (
            <>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:inline"
            >
              Connexion
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-amber-50 shadow-sm transition-colors hover:bg-stone-800"
            >
              Créer un compte
            </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

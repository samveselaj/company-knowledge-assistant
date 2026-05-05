"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ApiKeyManager from "./ApiKeyManager";
import ApiKeyNotice from "./ApiKeyNotice";
import ThemeToggle from "./ThemeToggle";
import { AUTH_CHANGED_EVENT, clearAuthSession, fetchCurrentUser, getStoredUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/upload", label: "Upload" },
];

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    setUser(getStoredUser());
    setHydrated(true);

    async function loadUser() {
      const currentUser = await fetchCurrentUser();
      if (active) {
        setUser(currentUser);
      }
    }

    loadUser();
    window.addEventListener(AUTH_CHANGED_EVENT, loadUser as EventListener);
    window.addEventListener("storage", loadUser);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, loadUser as EventListener);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const visibleNavItems = !hydrated
    ? navItems.filter((item) => item.href === "/")
    : navItems.filter((item) => {
        if (!user) {
          return item.href === "/";
        }
        if (item.href === "/admin/documents") {
          return true;
        }
        if (item.href.startsWith("/admin")) {
          return user.role === "admin";
        }
        return true;
      });

  const showAuthControls = hydrated;

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand" aria-label="Company Knowledge Assistant">
            <span className="brand-mark">K</span>
            <span className="brand-copy">
              <span>Knowledge Assistant</span>
              <span>Internal answers</span>
            </span>
          </Link>

          <div className="topbar-actions">
            <nav className="desktop-nav" aria-label="Primary">
              {visibleNavItems.map((item) => {
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link${isActive ? " active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {showAuthControls && user ? (
              <button type="button" className={`utility-button${apiKeyOpen ? " active" : ""}`} onClick={() => setApiKeyOpen((value) => !value)}>
                AI Provider
              </button>
            ) : null}
            {showAuthControls ? (
              user ? (
                <button
                  type="button"
                  className="utility-button"
                  onClick={() => {
                    clearAuthSession();
                    setApiKeyOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className="utility-button">
                  Login
                </Link>
              )
            ) : null}
            <ThemeToggle />

            <button
              type="button"
              className="menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              Menu
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={`mobile-nav${menuOpen ? " open" : ""}`}
          aria-hidden={!menuOpen}
        >
          {visibleNavItems.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-link${isActive ? " active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          {showAuthControls && user ? (
            <button type="button" className={`mobile-nav-link utility-mobile${apiKeyOpen ? " active" : ""}`} onClick={() => setApiKeyOpen((value) => !value)}>
              AI Provider
            </button>
          ) : null}
          {showAuthControls ? (
            user ? (
              <button
                type="button"
                className="mobile-nav-link utility-mobile"
                onClick={() => {
                  clearAuthSession();
                  setMenuOpen(false);
                  setApiKeyOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="mobile-nav-link utility-mobile" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )
          ) : null}
        </div>
        {showAuthControls && user ? <ApiKeyNotice onManageKey={() => setApiKeyOpen(true)} /> : null}
      </header>

      {apiKeyOpen && user ? <ApiKeyManager onClose={() => setApiKeyOpen(false)} /> : null}
      <main className="page-shell">{children}</main>
    </div>
  );
}

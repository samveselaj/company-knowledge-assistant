"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ApiKeyManager from "./ApiKeyManager";
import ApiKeyNotice from "./ApiKeyNotice";
import ThemeToggle from "./ThemeToggle";

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
              {navItems.map((item) => {
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

            <button type="button" className={`utility-button${apiKeyOpen ? " active" : ""}`} onClick={() => setApiKeyOpen((value) => !value)}>
              API Key
            </button>
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
          {navItems.map((item) => {
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
          <button type="button" className={`mobile-nav-link utility-mobile${apiKeyOpen ? " active" : ""}`} onClick={() => setApiKeyOpen((value) => !value)}>
            API Key
          </button>
        </div>
        <ApiKeyNotice onManageKey={() => setApiKeyOpen(true)} />
      </header>

      {apiKeyOpen ? <ApiKeyManager onClose={() => setApiKeyOpen(false)} /> : null}
      <main className="page-shell">{children}</main>
    </div>
  );
}

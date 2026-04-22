"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const navItems = [
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/admin", label: "Dashboard", icon: "📊", section: "Admin" },
  { href: "/admin/documents", label: "Documents", icon: "📄" },
  { href: "/admin/upload", label: "Upload", icon: "⬆️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  let lastSection = "";

  return (
    <nav className="sidebar" id="main-sidebar">
      <div className="sidebar-logo">⚡ Knowledge AI</div>
      {navItems.map((item) => {
        const showSection = item.section && item.section !== lastSection;
        if (item.section) lastSection = item.section;
        return (
          <div key={item.href}>
            {showSection && <div className="sidebar-section">{item.section}</div>}
            <Link
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

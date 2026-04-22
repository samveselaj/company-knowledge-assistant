"use client";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api";
import { AdminStats } from "@/lib/types";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => { getAdminStats().then(setStats).catch(() => {}); }, []);

  const cards = stats ? [
    { label: "Total Documents", value: stats.total_documents, icon: "📄" },
    { label: "Indexed", value: stats.indexed_documents, icon: "✅", color: "var(--success)" },
    { label: "Pending", value: stats.pending_documents, icon: "⏳", color: "var(--warning)" },
    { label: "Failed", value: stats.failed_documents, icon: "❌", color: "var(--danger)" },
    { label: "Chat Sessions", value: stats.total_sessions, icon: "💬" },
  ] : [];

  return (
    <div>
      <div className="page-header"><h1>📊 Dashboard</h1><p>Overview of your knowledge base</p></div>
      {!stats ? <div className="spinner" /> : (
        <div className={styles.grid}>
          {cards.map((c) => (
            <div className="card" key={c.label}>
              <div className={styles.statIcon}>{c.icon}</div>
              <div className={styles.statValue} style={c.color ? { color: c.color } : {}}>{c.value}</div>
              <div className={styles.statLabel}>{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

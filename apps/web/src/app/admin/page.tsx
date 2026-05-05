"use client";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api";
import { AdminStats } from "@/lib/types";
import AuthGate from "@/components/auth/AuthGate";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => { getAdminStats().then(setStats).catch(() => {}); }, []);

  const cards = stats ? [
    { label: "Total documents", value: stats.total_documents },
    { label: "Indexed", value: stats.indexed_documents },
    { label: "Pending", value: stats.pending_documents },
    { label: "Failed", value: stats.failed_documents },
    { label: "Chat sessions", value: stats.total_sessions },
  ] : [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Admin"
        title="Overview"
        description="A quick snapshot of document volume, indexing health, and chat usage."
      />
      <AuthGate allowedRoles={["admin"]}>
        {!stats ? (
          <Surface className="state-card">
            <div className="chat-status" role="status" aria-live="polite">
              <span className="chat-status-dots" aria-hidden="true">
                <span /><span /><span />
              </span>
              <span>Loading dashboard…</span>
            </div>
          </Surface>
        ) : (
          <div className="stats-grid">
            {cards.map((c) => (
              <Surface className="stat-card" key={c.label}>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value}</div>
              </Surface>
            ))}
          </div>
        )}
      </AuthGate>
    </div>
  );
}

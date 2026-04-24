"use client";
import { useEffect, useState } from "react";
import { listDocuments } from "@/lib/api";
import { DocumentItem } from "@/lib/types";
import AuthGate from "@/components/auth/AuthGate";
import DocumentTable from "@/components/admin/DocumentTable";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try { const data = await listDocuments(); setDocs(data.documents || []); }
    catch { setDocs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;

    async function loadDocs() {
      try {
        const data = await listDocuments();
        if (active) {
          setDocs(data.documents || []);
        }
      } catch {
        if (active) {
          setDocs([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDocs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Admin"
        title="Documents"
        description="Review uploaded files, track indexing status, and manage the current knowledge set."
      />
      <AuthGate>
        {loading ? <Surface className="state-card">Loading documents…</Surface> : <DocumentTable documents={docs} onRefresh={fetchDocs} />}
      </AuthGate>
    </div>
  );
}

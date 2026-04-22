"use client";
import { useEffect, useState, useCallback } from "react";
import { listDocuments } from "@/lib/api";
import { DocumentItem } from "@/lib/types";
import DocumentTable from "@/components/admin/DocumentTable";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try { const data = await listDocuments(); setDocs(data.documents || []); }
    catch { setDocs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  return (
    <div>
      <div className="page-header"><h1>📄 Documents</h1><p>Manage your uploaded documents</p></div>
      {loading ? <div className="spinner" /> : <DocumentTable documents={docs} onRefresh={fetchDocs} />}
    </div>
  );
}

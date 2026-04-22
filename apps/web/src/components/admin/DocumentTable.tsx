"use client";
import { useState } from "react";
import { DocumentItem } from "@/lib/types";
import { indexDocument, deleteDocument } from "@/lib/api";
import StatusBadge from "./StatusBadge";
import styles from "./DocumentTable.module.css";

type Props = { documents: DocumentItem[]; onRefresh: () => void };

export default function DocumentTable({ documents, onRefresh }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleIndex = async (id: string) => {
    setLoadingId(id);
    try { await indexDocument(id); onRefresh(); }
    catch (e) { alert("Indexing failed: " + (e as Error).message); }
    finally { setLoadingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    setLoadingId(id);
    try { await deleteDocument(id); onRefresh(); }
    catch (e) { alert("Delete failed: " + (e as Error).message); }
    finally { setLoadingId(null); }
  };

  if (!documents.length) {
    return <div className={styles.empty}>No documents uploaded yet. <a href="/admin/upload">Upload one →</a></div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} id="documents-table">
        <thead>
          <tr><th>Title</th><th>File</th><th>Status</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className={styles.title}>{doc.title}</td>
              <td className={styles.file}>{doc.file_name}</td>
              <td><StatusBadge status={doc.status} /></td>
              <td className={styles.date}>{new Date(doc.created_at).toLocaleDateString()}</td>
              <td className={styles.actions}>
                {doc.status !== "indexed" && (
                  <button className="btn-primary" disabled={loadingId === doc.id} onClick={() => handleIndex(doc.id)} id={`index-${doc.id}`}>
                    {loadingId === doc.id ? <span className="spinner" /> : "Index"}
                  </button>
                )}
                <button className="btn-danger" disabled={loadingId === doc.id} onClick={() => handleDelete(doc.id)} id={`delete-${doc.id}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

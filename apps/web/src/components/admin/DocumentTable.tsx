"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthUser, DocumentItem } from "@/lib/types";
import { indexDocument, reindexDocument, deleteDocument } from "@/lib/api";
import { AUTH_CHANGED_EVENT, fetchCurrentUser, getStoredUser } from "@/lib/auth";
import StatusBadge from "./StatusBadge";
import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";

type Props = { documents: DocumentItem[]; onRefresh: () => void };

export default function DocumentTable({ documents, onRefresh }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let active = true;
    setUser(getStoredUser());
    async function loadUser() {
      const currentUser = await fetchCurrentUser();
      if (active) {
        setUser(currentUser);
      }
    }

    loadUser();
    window.addEventListener(AUTH_CHANGED_EVENT, loadUser as EventListener);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, loadUser as EventListener);
    };
  }, []);

  const handleIndex = async (id: string) => {
    setErrorMessage(null);
    setLoadingId(id);
    try { await indexDocument(id); onRefresh(); }
    catch (e) { setErrorMessage((e as Error).message); }
    finally { setLoadingId(null); }
  };

  const handleReindex = async (id: string) => {
    setErrorMessage(null);
    setLoadingId(id);
    try { await reindexDocument(id); onRefresh(); }
    catch (e) { setErrorMessage((e as Error).message); }
    finally { setLoadingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    setErrorMessage(null);
    setLoadingId(id);
    try { await deleteDocument(id); onRefresh(); }
    catch (e) { setErrorMessage((e as Error).message); }
    finally { setLoadingId(null); }
  };

  if (!documents.length) {
    return (
      <Surface className="state-card">
        No documents uploaded yet. {isAdmin ? <Link href="/admin/upload">Upload one</Link> : null}
      </Surface>
    );
  }

  return (
    <Surface className="table-card">
      {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
      <div className="desktop-table">
        <table className="data-table" id="documents-table">
          <thead>
            <tr><th>Title</th><th>File</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="document-title">{doc.title}</div>
                  {doc.department ? <div className="document-meta">{doc.department}</div> : null}
                </td>
                <td className="document-meta">{doc.file_name}</td>
                <td><StatusBadge status={doc.status} /></td>
                <td className="document-meta">{new Date(doc.created_at).toLocaleDateString()}</td>
                <td>
                  {isAdmin ? (
                    <div className="table-actions">
                      {doc.status !== "indexed" ? (
                        <Button
                          size="sm"
                          disabled={loadingId === doc.id}
                          onClick={() => handleIndex(doc.id)}
                          id={`index-${doc.id}`}
                        >
                          {loadingId === doc.id ? "Working…" : "Index"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={loadingId === doc.id}
                          onClick={() => handleReindex(doc.id)}
                          id={`reindex-${doc.id}`}
                        >
                          {loadingId === doc.id ? "Working…" : "Re-index"}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={loadingId === doc.id}
                        onClick={() => handleDelete(doc.id)}
                        id={`delete-${doc.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <span className="document-meta">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-documents">
        {documents.map((doc) => (
          <div className="document-card" key={doc.id}>
            <div className="document-card-row">
              <div>
                <div className="document-title">{doc.title}</div>
                {doc.department ? <div className="document-meta">{doc.department}</div> : null}
              </div>
              <StatusBadge status={doc.status} />
            </div>
            <div className="document-card-row">
              <span className="document-label">File</span>
              <span className="document-meta">{doc.file_name}</span>
            </div>
            <div className="document-card-row">
              <span className="document-label">Created</span>
              <span className="document-meta">{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
            {isAdmin ? (
              <div className="table-actions">
                {doc.status !== "indexed" ? (
                  <Button
                    size="sm"
                    disabled={loadingId === doc.id}
                    onClick={() => handleIndex(doc.id)}
                    id={`mobile-index-${doc.id}`}
                  >
                    {loadingId === doc.id ? "Working…" : "Index"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={loadingId === doc.id}
                    onClick={() => handleReindex(doc.id)}
                    id={`mobile-reindex-${doc.id}`}
                  >
                    {loadingId === doc.id ? "Working…" : "Re-index"}
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  disabled={loadingId === doc.id}
                  onClick={() => handleDelete(doc.id)}
                  id={`mobile-delete-${doc.id}`}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Surface>
  );
}

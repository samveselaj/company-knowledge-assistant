"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";
import { AUTH_CHANGED_EVENT, fetchCurrentUser, getStoredUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    let active = true;
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

  return (
    <div className="page">
      <PageHeader
        eyebrow="Knowledge Base"
        title="Company Knowledge Assistant"
        description="Upload internal documents, index them, and ask grounded questions with citations."
        actions={
          <>
            <Button href={user ? "/chat" : "/login?next=%2Fchat"} variant="primary">
              {user ? "Open chat" : "Login"}
            </Button>
            {user?.role === "admin" ? <Button href="/admin/upload">Upload documents</Button> : null}
          </>
        }
      />

      <section className="grid grid-2">
        <Surface>
          <div className="page-eyebrow">Assistant</div>
          <h2 className="section-title">Ask questions in plain language</h2>
          <p className="section-copy">
            Search across uploaded materials and get grounded answers with source snippets.
          </p>
        </Surface>
        <Surface>
          <div className="page-eyebrow">Documents</div>
          <h2 className="section-title">Manage uploads and indexing</h2>
          <p className="section-copy">
            Review document status, upload new files, and keep the knowledge base up to date.
          </p>
        </Surface>
      </section>

      <section className="grid grid-3">
        <Surface>
          <div className="page-eyebrow">Chat</div>
          <p className="section-copy">Ask about policies, onboarding, support workflows, or internal process docs.</p>
        </Surface>
        <Surface>
          <div className="page-eyebrow">Admin</div>
          <p className="section-copy">Track document counts, indexing status, and uploaded content from one place.</p>
        </Surface>
        <Surface>
          <div className="page-eyebrow">Themes</div>
          <p className="section-copy">Light and dark modes use the same spacing, contrast, and component structure.</p>
        </Surface>
      </section>

      <Surface>
        <div className="page-eyebrow">Workflow</div>
        <h2 className="section-title">Upload, index, ask.</h2>
        <p className="section-copy">
          The interface is focused on the core workflow instead of decorative landing page sections.
        </p>
        <div className="section-actions">
          {user?.role === "admin" ? <Button href="/admin">View dashboard</Button> : null}
          {user ? <Button href="/admin/documents">Review documents</Button> : <Button href="/login?next=%2Fadmin%2Fdocuments">Review documents</Button>}
        </div>
      </Surface>
    </div>
  );
}

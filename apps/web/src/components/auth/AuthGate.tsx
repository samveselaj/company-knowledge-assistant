"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import {
  AUTH_CHANGED_EVENT,
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
} from "@/lib/auth";
import type { AuthUser, UserRole } from "@/lib/types";

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export default function AuthGate({ children, allowedRoles }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setUser(getStoredUser());

    async function load() {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const currentUser = await fetchCurrentUser();
      if (active) {
        setUser(currentUser);
        setLoading(false);
        if (!currentUser) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    }

    load();
    window.addEventListener(AUTH_CHANGED_EVENT, load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <Surface className="state-card">
        <div className="chat-status" role="status" aria-live="polite">
          <span className="chat-status-dots" aria-hidden="true">
            <span /><span /><span />
          </span>
          <span>Checking access…</span>
        </div>
      </Surface>
    );
  }

  if (!user) {
    return (
      <Surface className="state-card">
        Sign in to continue.
        <div className="section-actions">
          <Button href={`/login?next=${encodeURIComponent(pathname)}`} variant="primary">
            Login
          </Button>
        </div>
      </Surface>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Surface className="state-card">
        You do not have permission to access this page.
        <div className="section-actions">
          <Button href="/chat" variant="primary">
            Open chat
          </Button>
        </div>
      </Surface>
    );
  }

  return children;
}

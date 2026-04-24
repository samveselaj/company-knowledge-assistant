"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      const params = new URLSearchParams(window.location.search);
      router.push(params.get("next") || "/chat");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Access"
        title="Sign in"
        description="Use your company account to ask questions or manage the knowledge base."
      />
      <Surface className="form-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <Field
            label="Email"
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <Field
            label="Password"
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          <div className="field-hint">
            Demo admin: admin@example.com / admin123. Demo user: user@example.com / user123.
          </div>
        </form>
      </Surface>
    </div>
  );
}

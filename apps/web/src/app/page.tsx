import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>⚡</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Company Knowledge Assistant</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500, lineHeight: 1.7, marginBottom: 32 }}>
        Upload internal documents, index them with AI, and get instant answers with citations.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/chat" className="btn-primary" style={{ padding: "12px 28px", fontSize: 15 }}>Start Chatting →</Link>
        <Link href="/admin/upload" className="btn-ghost" style={{ padding: "12px 28px", fontSize: 15 }}>Upload Documents</Link>
      </div>
    </div>
  );
}

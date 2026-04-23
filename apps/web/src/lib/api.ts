import { getStoredOpenAiKey } from "./openai-key";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function buildHeaders(headers: HeadersInit = {}) {
  const openAiKey = getStoredOpenAiKey();
  return {
    ...headers,
    ...(openAiKey ? { "x-openai-api-key": openAiKey } : {}),
  };
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/documents`, { cache: "no-store", headers: buildHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function indexDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/index`, {
    method: "POST",
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function askQuestion(payload: { session_id?: string | null; question: string; department?: string | null }) {
  const res = await fetch(`${API_BASE}/chat/ask`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitFeedback(payload: { message_id: string; rating: string; comment?: string }) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, { cache: "no-store", headers: buildHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getHealthConfig() {
  const res = await fetch(`${API_BASE}/health/config`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

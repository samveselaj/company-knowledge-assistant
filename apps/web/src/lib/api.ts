import { getStoredAiSettings } from "./openai-key";
import { getStoredToken } from "./auth";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function parseResponse(res: Response) {
  if (res.ok) {
    return res.json();
  }

  let message = "Request failed";
  try {
    const data = await res.json();
    message = data.detail || message;
  } catch {
    message = await res.text();
  }
  throw new Error(message);
}

function buildHeaders(headers: HeadersInit = {}) {
  const settings = getStoredAiSettings();
  const openAiKey = settings.providers.openai.apiKey;
  const activeProviderSettings = settings.providers[settings.activeProvider];
  const token = getStoredToken();

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(openAiKey ? { "x-openai-api-key": openAiKey } : {}),
    "x-ai-provider": settings.activeProvider,
    ...(activeProviderSettings.apiKey ? { "x-ai-api-key": activeProviderSettings.apiKey } : {}),
    ...(activeProviderSettings.chatModel ? { "x-ai-chat-model": activeProviderSettings.chatModel } : {}),
  };
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
    headers: buildHeaders(),
  });
  return parseResponse(res);
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/documents`, { cache: "no-store", headers: buildHeaders() });
  return parseResponse(res);
}

export async function getDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents/${documentId}`, { cache: "no-store", headers: buildHeaders() });
  return parseResponse(res);
}

export async function indexDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/index`, {
    method: "POST",
    headers: buildHeaders(),
  });
  return parseResponse(res);
}

export async function reindexDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/reindex`, {
    method: "POST",
    headers: buildHeaders(),
  });
  return parseResponse(res);
}

export async function deleteDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseResponse(res);
}

export async function askQuestion(payload: { session_id?: string | null; question: string; department?: string | null }) {
  const res = await fetch(`${API_BASE}/chat/ask`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function submitFeedback(payload: { message_id: string; rating: string; comment?: string }) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, { cache: "no-store", headers: buildHeaders() });
  return parseResponse(res);
}

export async function getHealthConfig() {
  const res = await fetch(`${API_BASE}/health/config`, { cache: "no-store" });
  return parseResponse(res);
}

export async function getProviderModels(provider: string, options?: { refresh?: boolean }) {
  const url = new URL(`${API_BASE}/providers/${provider}/models`);
  if (options?.refresh) url.searchParams.set("refresh", "true");
  const res = await fetch(url.toString(), { cache: "no-store", headers: buildHeaders() });
  return parseResponse(res);
}

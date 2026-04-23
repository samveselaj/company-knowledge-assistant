export type DocumentItem = {
  id: string;
  title: string;
  file_name: string;
  status: string;
  department?: string | null;
  error_message?: string | null;
  created_at: string;
};

export type Citation = {
  document_id: string;
  document_title: string;
  chunk_id: string;
  snippet: string;
  page_number?: number | null;
};

export type AskResponse = {
  session_id: string;
  answer: string;
  citations: Citation[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export type AdminStats = {
  total_documents: number;
  indexed_documents: number;
  pending_documents: number;
  failed_documents: number;
  total_sessions: number;
};

export type HealthConfig = {
  status: string;
  server_openai_key_configured: boolean;
};

"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage as Msg } from "@/lib/types";
import { askQuestion, listDocuments } from "@/lib/api";
import { CHAT_PROVIDER_OPTIONS, getStoredAiSettings, AI_SETTINGS_CHANGED_EVENT } from "@/lib/openai-key";
import MessageBubble from "./MessageBubble";
import QuestionInput from "./QuestionInput";
import Surface from "@/components/ui/Surface";

const EXAMPLE_QUESTIONS = [
  "What is our PTO policy?",
  "How does the onboarding process work?",
  "Summarize the latest engineering handbook.",
];

type DocStats = { total: number; indexed: number } | null;

function getProviderLabel(): string | null {
  if (typeof window === "undefined") return null;
  const settings = getStoredAiSettings();
  const provider = CHAT_PROVIDER_OPTIONS.find((p) => p.id === settings.activeProvider);
  return provider?.label ?? null;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [docStats, setDocStats] = useState<DocStats>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    let active = true;
    listDocuments()
      .then((data) => {
        if (!active) return;
        const docs = data?.documents ?? [];
        const total = typeof data?.total === "number" ? data.total : docs.length;
        const indexed = docs.filter((d: { status?: string }) => d.status === "indexed").length;
        setDocStats({ total, indexed });
      })
      .catch(() => { /* ignore — count is best-effort */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const sync = () => setProviderLabel(getProviderLabel());
    sync();
    window.addEventListener(AI_SETTINGS_CHANGED_EVENT, sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AI_SETTINGS_CHANGED_EVENT, sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleAsk = async (question: string) => {
    const userMsg: Msg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await askQuestion({ session_id: sessionId, question });
      setSessionId(res.session_id);
      const assistantMsg: Msg = { role: "assistant", content: res.answer, citations: res.citations };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: (error as Error).message || "Sorry, something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  const noDocuments = docStats !== null && docStats.total === 0;
  const indexedCount = docStats?.indexed ?? null;

  return (
    <Surface className="chat-shell">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="page-eyebrow">Start a conversation</div>
            {noDocuments ? (
              <>
                <h2>Upload documents to start asking questions.</h2>
                <p>Once your team adds files, the assistant will answer using those sources with citations.</p>
              </>
            ) : (
              <>
                <h2>Ask about policies, onboarding, support workflows, or internal docs.</h2>
                <p>Answers are grounded in your uploaded documents and include source snippets when available.</p>
              </>
            )}
            <div className="chat-suggestions" aria-label="Example questions">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => handleAsk(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && (
          <div className="chat-status" role="status" aria-live="polite">
            <span className="chat-status-dots" aria-hidden="true">
              <span /><span /><span />
            </span>
            <span>Searching your documents…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <QuestionInput onSubmit={handleAsk} disabled={loading} />
      {(indexedCount !== null || providerLabel) && (
        <div className="chat-meta">
          {indexedCount !== null ? (
            <span>
              {indexedCount} {indexedCount === 1 ? "document" : "documents"} indexed
            </span>
          ) : null}
          {providerLabel ? <span>Model: {providerLabel}</span> : null}
        </div>
      )}
    </Surface>
  );
}

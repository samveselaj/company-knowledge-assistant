"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage as Msg } from "@/lib/types";
import { askQuestion } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import QuestionInput from "./QuestionInput";
import Surface from "@/components/ui/Surface";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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

  return (
    <Surface className="chat-shell">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="page-eyebrow">Start a conversation</div>
            <h2>Ask about policies, onboarding, support workflows, or internal docs.</h2>
            <p>Responses are generated from the indexed knowledge base and include citations when available.</p>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && <div className="chat-status">Thinking…</div>}
        <div ref={endRef} />
      </div>
      <QuestionInput onSubmit={handleAsk} disabled={loading} />
    </Surface>
  );
}

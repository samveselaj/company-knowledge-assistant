"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage as Msg } from "@/lib/types";
import { askQuestion } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import QuestionInput from "./QuestionInput";
import styles from "./ChatWindow.module.css";

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
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.window}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>⚡</div>
            <h2>Company Knowledge Assistant</h2>
            <p>Ask questions about your uploaded documents and get grounded answers with citations.</p>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && <div className={styles.thinking}><span className="spinner" /> Thinking<span className="loading-dots" /></div>}
        <div ref={endRef} />
      </div>
      <QuestionInput onSubmit={handleAsk} disabled={loading} />
    </div>
  );
}

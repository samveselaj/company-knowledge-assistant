"use client";
import { useState, useRef } from "react";
import styles from "./QuestionInput.module.css";

type Props = { onSubmit: (question: string) => void; disabled?: boolean };

export default function QuestionInput({ onSubmit, disabled }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const q = text.trim();
    if (!q || disabled) return;
    onSubmit(q);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className={styles.wrap}>
      <textarea
        ref={inputRef}
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents..."
        rows={1}
        disabled={disabled}
        id="question-input"
      />
      <button className={`btn-primary ${styles.send}`} onClick={handleSubmit} disabled={!text.trim() || disabled} id="send-button">
        {disabled ? <span className="spinner" /> : "Send"}
      </button>
    </div>
  );
}

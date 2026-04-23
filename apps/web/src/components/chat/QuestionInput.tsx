"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";

type Props = { onSubmit: (question: string) => void; disabled?: boolean };

export default function QuestionInput({ onSubmit, disabled }: Props) {
  const [text, setText] = useState("");

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
    <div className="question-input">
      <div className="question-input-field">
        <Field
          multiline
          label="Ask a question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          rows={3}
          disabled={disabled}
          id="question-input"
          className="question-textarea"
        />
        <div className="question-input-meta">
          <span className="field-hint">Press Enter to send, Shift+Enter for a new line.</span>
          <Button variant="primary" onClick={handleSubmit} disabled={!text.trim() || disabled} id="send-button">
            {disabled ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

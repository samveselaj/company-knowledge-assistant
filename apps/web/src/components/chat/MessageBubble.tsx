import { ChatMessage as Msg } from "@/lib/types";
import CitationCard from "./CitationCard";

type Props = { message: Msg };

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const hasCitations = !!message.citations && message.citations.length > 0;
  return (
    <div className={`message-row${isUser ? " user" : ""}`}>
      <div className="message-meta">{isUser ? "You" : "Assistant"}</div>
      <div className={`message-bubble${isUser ? " user" : ""}`}>
        <div className="message-content">{message.content}</div>
        {!isUser && hasCitations && (
          <div className="citation-group">
            <div className="citation-group-header">
              <span className="citation-label">Sources</span>
              <span className="citation-count">{message.citations!.length}</span>
            </div>
            <div className="citation-grid">
              {message.citations!.map((c, i) => <CitationCard key={i} citation={c} index={i + 1} />)}
            </div>
            <div className="message-trust">Answer based on your uploaded documents.</div>
          </div>
        )}
        {!isUser && !hasCitations && (
          <div className="citation-group">
            <div className="citation-group-header">
              <span className="citation-label">Sources</span>
            </div>
            <div className="citation-empty">
              No specific sources cited for this answer.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

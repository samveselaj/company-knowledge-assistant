import { ChatMessage as Msg } from "@/lib/types";
import CitationCard from "./CitationCard";

type Props = { message: Msg };

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={`message-row${isUser ? " user" : ""}`}>
      <div className="message-meta">{isUser ? "You" : "Assistant"}</div>
      <div className={`message-bubble${isUser ? " user" : ""}`}>
        <div className="message-content">{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className="citation-group">
            <div className="citation-label">Sources</div>
            <div className="citation-grid">
              {message.citations.map((c, i) => <CitationCard key={i} citation={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

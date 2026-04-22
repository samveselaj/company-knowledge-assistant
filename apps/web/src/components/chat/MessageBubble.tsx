import { ChatMessage as Msg } from "@/lib/types";
import CitationCard from "./CitationCard";
import styles from "./MessageBubble.module.css";

type Props = { message: Msg };

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={`${styles.row} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.avatar}>{isUser ? "👤" : "⚡"}</div>
      <div className={styles.bubble}>
        <div className={styles.content}>{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className={styles.citations}>
            <div className={styles.citLabel}>Sources</div>
            <div className={styles.citGrid}>
              {message.citations.map((c, i) => <CitationCard key={i} citation={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Citation } from "@/lib/types";
import styles from "./CitationCard.module.css";

type Props = { citation: Citation };

export default function CitationCard({ citation }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>📄</span>
        <span className={styles.title}>{citation.document_title}</span>
        {citation.page_number && <span className={styles.page}>p.{citation.page_number}</span>}
      </div>
      <p className={styles.snippet}>{citation.snippet}</p>
    </div>
  );
}

import styles from "./StatusBadge.module.css";

type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  const map: Record<string, string> = {
    pending: styles.pending,
    processing: styles.processing,
    indexed: styles.indexed,
    failed: styles.failed,
  };
  return <span className={`${styles.badge} ${map[status] || styles.pending}`}>{status}</span>;
}

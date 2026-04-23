type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

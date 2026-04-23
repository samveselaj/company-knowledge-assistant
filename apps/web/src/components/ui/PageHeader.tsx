type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <div className="page-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}

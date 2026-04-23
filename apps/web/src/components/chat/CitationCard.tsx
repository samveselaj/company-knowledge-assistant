import { Citation } from "@/lib/types";

type Props = { citation: Citation };

export default function CitationCard({ citation }: Props) {
  return (
    <div className="citation-card">
      <div className="citation-card-header">
        <span className="citation-title">{citation.document_title}</span>
        {citation.page_number ? <span className="citation-page">p.{citation.page_number}</span> : null}
      </div>
      <p className="citation-snippet">{citation.snippet}</p>
    </div>
  );
}

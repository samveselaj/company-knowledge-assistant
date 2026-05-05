import { Citation } from "@/lib/types";

type Props = { citation: Citation; index?: number };

export default function CitationCard({ citation, index }: Props) {
  return (
    <div className="citation-card">
      <div className="citation-card-header">
        <span className="citation-title">
          {typeof index === "number" ? <span className="citation-index">{index}</span> : null}
          {citation.document_title}
        </span>
        {citation.page_number ? <span className="citation-page">p.{citation.page_number}</span> : null}
      </div>
      {citation.snippet ? <p className="citation-snippet">{citation.snippet}</p> : null}
    </div>
  );
}

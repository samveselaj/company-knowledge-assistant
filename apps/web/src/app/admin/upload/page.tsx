import UploadForm from "@/components/admin/UploadForm";
import PageHeader from "@/components/ui/PageHeader";

export default function UploadPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Admin"
        title="Upload a document"
        description="Add a TXT, PDF, or DOCX file to the knowledge base with optional metadata."
      />
      <UploadForm />
    </div>
  );
}

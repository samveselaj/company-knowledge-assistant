import UploadForm from "@/components/admin/UploadForm";

export default function UploadPage() {
  return (
    <div>
      <div className="page-header"><h1>⬆️ Upload Document</h1><p>Upload a TXT, PDF, or DOCX file to the knowledge base</p></div>
      <UploadForm />
    </div>
  );
}

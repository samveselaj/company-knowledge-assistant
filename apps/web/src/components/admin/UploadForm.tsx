"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/api";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Surface from "@/components/ui/Surface";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setErrorMessage(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title) fd.append("title", title);
      if (department) fd.append("department", department);
      await uploadDocument(fd);
      router.push("/admin/documents");
    } catch (err) { setErrorMessage((err as Error).message); }
    finally { setUploading(false); }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); };

  return (
    <Surface className="form-card">
      <form onSubmit={handleSubmit} id="upload-form">
        <div
          className={`upload-dropzone${dragActive ? " active" : ""}${file ? " has-file" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".txt,.pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} hidden id="file-input" />
          {file ? (
            <div className="upload-file">
              <span>{file.name}</span>
              <span className="upload-file-meta">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <div className="upload-prompt">
              <p>Drop a file here or click to browse.</p>
              <p className="upload-hint">Supports TXT, PDF, and DOCX.</p>
            </div>
          )}
        </div>

        <div className="form-grid">
          <Field
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Auto-detected from the filename"
            id="title-input"
          />
          <Field
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="HR, Engineering, Legal"
            id="department-input"
          />
        </div>

        {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={!file || uploading} id="upload-button">
            {uploading ? "Uploading…" : "Upload document"}
          </Button>
        </div>
      </form>
    </Surface>
  );
}

"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/api";
import styles from "./UploadForm.module.css";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title) fd.append("title", title);
      if (department) fd.append("department", department);
      await uploadDocument(fd);
      router.push("/admin/documents");
    } catch (err) { alert("Upload failed: " + (err as Error).message); }
    finally { setUploading(false); }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); };

  return (
    <form onSubmit={handleSubmit} className={styles.form} id="upload-form">
      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ""} ${file ? styles.hasFile : ""}`}
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".txt,.pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} hidden id="file-input" />
        {file ? (
          <div className={styles.fileInfo}><span className={styles.fileIcon}>📄</span><span>{file.name}</span><span className={styles.fileSize}>({(file.size / 1024).toFixed(1)} KB)</span></div>
        ) : (
          <div className={styles.dropPrompt}><span className={styles.uploadIcon}>⬆️</span><p>Drop a file here or click to browse</p><p className={styles.hint}>Supports TXT, PDF, DOCX</p></div>
        )}
      </div>
      <div className={styles.fields}>
        <div className={styles.field}><label>Title (optional)</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Auto-detected from filename" id="title-input" /></div>
        <div className={styles.field}><label>Department (optional)</label><input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. HR, Engineering, Legal" id="department-input" /></div>
      </div>
      <button type="submit" className="btn-primary" disabled={!file || uploading} id="upload-button">
        {uploading ? <><span className="spinner" /> Uploading...</> : "Upload Document"}
      </button>
    </form>
  );
}

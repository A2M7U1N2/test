"use client";

import { useState } from "react";
import { uploadSubjectFile } from "@/actions/files";
import { Button } from "@/components/ui/Button";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface Props {
  subjectId: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ subjectId, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);

    const result = await uploadSubjectFile(formData);

    setUploading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      onUploadComplete?.();
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "Click to upload study materials"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, Word, Images (Max 10MB)
          </p>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

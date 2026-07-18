"use client";

import { useEffect, useState } from "react";
import { getSubjectFiles, deleteSubjectFile } from "@/actions/files";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SubjectFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface Props {
  subjectId: string;
  refreshTrigger?: number;
}

export function FileList({ subjectId, refreshTrigger }: Props) {
  const [files, setFiles] = useState<SubjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [subjectId, refreshTrigger]);

  const loadFiles = async () => {
    setLoading(true);
    const data = await getSubjectFiles(subjectId);
    setFiles(data);
    setLoading(false);
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;

    setDeleting(fileId);
    const result = await deleteSubjectFile(fileId);
    setDeleting(null);

    if (result?.error) {
      alert(result.error);
    } else {
      loadFiles();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-4">
        No files uploaded yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between bg-card border border-border rounded-lg p-3"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {file.file_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.file_size)} • {file.file_type.toUpperCase()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(file.id)}
            disabled={deleting === file.id}
            className="flex-shrink-0"
          >
            {deleting === file.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-500" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}

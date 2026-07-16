"use client";

import { useState, useEffect } from "react";
import { Semester } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, id?: string) => void;
  editingSemester: Semester | null;
}

export function SemesterFormModal({ isOpen, onClose, onSave, editingSemester }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingSemester) {
      setName(editingSemester.name);
    } else {
      setName("");
    }
  }, [editingSemester, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), editingSemester?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingSemester ? "Edit Semester" : "Add Semester"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Input
          label="Semester Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Term 4"
        />

        <Button onClick={handleSave} className="w-full mt-5">
          Save
        </Button>
      </div>
    </div>
  );
}
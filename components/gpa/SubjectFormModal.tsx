"use client";

import { useState, useEffect } from "react";
import { Subject } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, "id"> & { id?: string }) => void;
  editingSubject: Subject | null;
}

// نظام الدرجات الحالي (4.0) - ممكن نغيره بعدين يبقى قابل للتخصيص
const GRADE_OPTIONS = [
  { value: "A", label: "A", point: 4.0 },
  { value: "A-", label: "A-", point: 3.7 },
  { value: "B+", label: "B+", point: 3.3 },
  { value: "B", label: "B", point: 3.0 },
  { value: "B-", label: "B-", point: 2.7 },
  { value: "C+", label: "C+", point: 2.3 },
  { value: "C", label: "C", point: 2.0 },
  { value: "C-", label: "C-", point: 1.7 },
  { value: "D+", label: "D+", point: 1.3 },
  { value: "D", label: "D", point: 1.0 },
  { value: "F", label: "F", point: 0.0 },
];

export function SubjectFormModal({ isOpen, onClose, onSave, editingSubject }: Props) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(3);
  const [grade, setGrade] = useState("A");

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setCredits(editingSubject.credits);
      setGrade(editingSubject.grade);
    } else {
      setName("");
      setCredits(3);
      setGrade("A");
    }
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    const gradeOption = GRADE_OPTIONS.find((g) => g.value === grade);
    onSave({
      id: editingSubject?.id,
      name: name.trim(),
      credits,
      grade,
      gradePoint: gradeOption?.point ?? 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingSubject ? "Edit Subject" : "Add Subject"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Circuit 1"
          />
          <Input
            label="Credits"
            type="number"
            min="0"
            step="0.5"
            value={credits}
            onChange={(e) => setCredits(parseFloat(e.target.value) || 0)}
          />
          <Select
            label="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            options={GRADE_OPTIONS.map((g) => ({ value: g.value, label: g.label }))}
          />
        </div>

        <Button onClick={handleSave} className="w-full mt-5">
          Save
        </Button>
      </div>
    </div>
  );
}
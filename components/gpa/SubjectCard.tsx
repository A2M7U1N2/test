"use client";

import { Subject } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

// بيحدد لون خلفية الدرجة حسب مستواها (أخضر للعالي، أحمر للواطي)
function getGradeColor(gradePoint: number, maxPoint: number = 4.0): string {
  const percent = gradePoint / maxPoint;
  if (percent >= 0.85) return "bg-green-600/20 text-green-400";
  if (percent >= 0.6) return "bg-orange-600/20 text-orange-400";
  return "bg-red-600/20 text-red-400";
}

export function SubjectCard({ subject, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{subject.name}</p>
        <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
      </div>

      <span
        className={`px-3 py-1 rounded-lg font-bold text-sm ${getGradeColor(
          subject.gradePoint
        )}`}
      >
        {subject.grade}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(subject)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(subject.id)}
          className="p-2 text-red-500 hover:text-red-400 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
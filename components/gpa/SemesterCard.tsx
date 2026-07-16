"use client";

import { Semester } from "@/lib/types";
import { calculateSemesterGPA, calculateSemesterCredits } from "@/lib/gpaCalculations";
import { Pencil, Trash2, ChevronRight, GraduationCap } from "lucide-react";

interface Props {
  semester: Semester;
  onOpen: (id: string) => void;
  onEdit: (semester: Semester) => void;
  onDelete: (id: string) => void;
}

export function SemesterCard({ semester, onOpen, onEdit, onDelete }: Props) {
  const gpa = calculateSemesterGPA(semester.subjects);
  const credits = calculateSemesterCredits(semester.subjects);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600/10 rounded-lg">
            <GraduationCap className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{semester.name}</p>
            <p
              className={`text-xs ${
                semester.completed ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              • {semester.completed ? "Completed" : "In Progress"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(semester)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(semester.id)}
            className="p-2 text-red-500 hover:text-red-400 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpen(semester.id)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Projected GPA</p>
          <p className="text-2xl font-bold text-foreground">{gpa.toFixed(2)}</p>
        </div>
        <span className="text-xs bg-black/20 text-muted-foreground px-3 py-1 rounded-full">
          {credits} Credits
        </span>
      </div>
    </div>
  );
}
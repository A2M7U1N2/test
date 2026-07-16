"use client";

import { ClassSession } from "@/lib/types";
import { Pencil, Trash2, MapPin, Clock } from "lucide-react";

interface Props {
  session: ClassSession;
  onEdit: (session: ClassSession) => void;
  onDelete: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Lecture: "bg-blue-600/20 text-blue-400",
  Section: "bg-purple-600/20 text-purple-400",
  Lab: "bg-green-600/20 text-green-400",
};

export function ClassSessionCard({ session, onEdit, onDelete }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-foreground">{session.subjectName}</p>
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md mt-1 ${
              TYPE_COLORS[session.sessionType]
            }`}
          >
            {session.sessionType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(session)}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="p-1.5 text-red-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {session.startTime} - {session.endTime}
        </span>
        {session.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {session.location}
          </span>
        )}
      </div>
    </div>
  );
}
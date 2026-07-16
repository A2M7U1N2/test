"use client";

import { AcademicEvent } from "@/lib/types";
import { Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";

interface Props {
  event: AcademicEvent;
  onEdit: (event: AcademicEvent) => void;
  onDelete: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Quiz: "bg-orange-600/20 text-orange-400",
  Assignment: "bg-blue-600/20 text-blue-400",
  Midterm: "bg-red-600/20 text-red-400",
  Final: "bg-red-700/30 text-red-300",
};

export function EventCard({ event, onEdit, onDelete }: Props) {
  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-foreground">{event.title}</p>
          <p className="text-xs text-muted-foreground">{event.subjectName}</p>
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md mt-1 ${
              TYPE_COLORS[event.eventType]
            }`}
          >
            {event.eventType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(event)}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-1.5 text-red-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <CalendarIcon className="h-3.5 w-3.5" />
        {formattedDate}
        {event.eventTime && ` • ${event.eventTime}`}
      </div>
    </div>
  );
}
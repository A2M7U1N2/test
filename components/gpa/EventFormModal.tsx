"use client";

import { useState, useEffect } from "react";
import { AcademicEvent, Subject } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<AcademicEvent, "id" | "subjectName"> & { id?: string }) => void;
  editingEvent: AcademicEvent | null;
  subjects: Subject[];
  semesterId: string;
}

const EVENT_TYPES = [
  { value: "Quiz", label: "Quiz" },
  { value: "Assignment", label: "Assignment" },
  { value: "Midterm", label: "Midterm" },
  { value: "Final", label: "Final" },
];

export function EventFormModal({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  subjects,
  semesterId,
}: Props) {
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<"Quiz" | "Assignment" | "Midterm" | "Final">("Quiz");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setSubjectId(editingEvent.subjectId);
      setTitle(editingEvent.title);
      setEventType(editingEvent.eventType);
      setEventDate(editingEvent.eventDate);
      setEventTime(editingEvent.eventTime || "");
    } else {
      setSubjectId(subjects[0]?.id || "");
      setTitle("");
      setEventType("Quiz");
      setEventDate("");
      setEventTime("");
    }
  }, [editingEvent, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!subjectId || !title.trim() || !eventDate) return;
    onSave({
      id: editingEvent?.id,
      semesterId,
      subjectId,
      title: title.trim(),
      eventType,
      eventDate,
      eventTime: eventTime || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingEvent ? "Edit Event" : "Add Event"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add subjects to this semester first before creating events.
          </p>
        ) : (
          <div className="space-y-4">
            <Select
              label="Subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Select
              label="Event Type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as "Quiz" | "Assignment" | "Midterm" | "Final")}
              options={EVENT_TYPES}
            />
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 3 Quiz"
            />
            <Input
              label="Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            <Input
              label="Time (optional)"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handleSave} className="w-full mt-5" disabled={subjects.length === 0}>
          Save
        </Button>
      </div>
    </div>
  );
}
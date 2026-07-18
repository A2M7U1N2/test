"use client";

import { useState, useEffect } from "react";
import { ClassSession, Subject } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<ClassSession, "id" | "subjectName"> & { id?: string }) => void;
  editingSession: ClassSession | null;
  subjects: Subject[];
  semesterId: string;
}

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const SESSION_TYPES = [
  { value: "Lecture", label: "Lecture" },
  { value: "Section", label: "Section" },
  { value: "Lab", label: "Lab" },
];

export function ClassSessionFormModal({
  isOpen,
  onClose,
  onSave,
  editingSession,
  subjects,
  semesterId,
}: Props) {
  const [subjectId, setSubjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [sessionType, setSessionType] = useState<"Lecture" | "Section" | "Lab">("Lecture");
  const [semesterEndDate, setSemesterEndDate] = useState("");

  useEffect(() => {
    if (editingSession) {
      setSubjectId(editingSession.subjectId);
      setDayOfWeek(editingSession.dayOfWeek.toString());
      setStartTime(editingSession.startTime);
      setEndTime(editingSession.endTime);
      setLocation(editingSession.location);
      setSessionType(editingSession.sessionType);
      setSemesterEndDate(editingSession.semesterEndDate || "");
    } else {
      setSubjectId(subjects[0]?.id || "");
      setDayOfWeek("1");
      setStartTime("10:00");
      setEndTime("12:00");
      setLocation("");
      setSessionType("Lecture");
      setSemesterEndDate("");
    }
  }, [editingSession, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!subjectId) return;
    onSave({
      id: editingSession?.id,
      semesterId,
      subjectId,
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      location,
      sessionType,
      semesterEndDate: semesterEndDate || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingSession ? "Edit Class" : "Add Class"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add subjects to this semester first (from the semester page) before scheduling classes.
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
              label="Type"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as "Lecture" | "Section" | "Lab")}
              options={SESSION_TYPES}
            />
            <Select
              label="Day"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              options={DAYS}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hall 3"
            />
            <Input
              label="Semester Ends On (optional)"
              type="date"
              value={semesterEndDate}
              onChange={(e) => setSemesterEndDate(e.target.value)}
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
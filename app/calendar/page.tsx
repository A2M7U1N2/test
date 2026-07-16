"use client";

import { useState, useEffect } from "react";
import { useSemesters } from "@/lib/SemesterContext";
import { useCalendar } from "@/lib/CalendarContext";
import { ClassSessionCard } from "@/components/gpa/ClassSessionCard";
import { EventCard } from "@/components/gpa/EventCard";
import { ClassSessionFormModal } from "@/components/gpa/ClassSessionFormModal";
import { EventFormModal } from "@/components/gpa/EventFormModal";
import { Select } from "@/components/ui/Select";
import { ClassSession, AcademicEvent } from "@/lib/types";
import { Plus } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CalendarPage() {
  const { semesters } = useSemesters();
  const {
    classSchedule,
    events,
    loading,
    loadForSemester,
    addClassSession,
    updateClassSession,
    deleteClassSession,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();

  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [tab, setTab] = useState<"schedule" | "events">("schedule");
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);

  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  useEffect(() => {
    if (selectedSemesterId) {
      loadForSemester(selectedSemesterId);
    }
  }, [selectedSemesterId]);

  const currentSemester = semesters.find((s) => s.id === selectedSemesterId);
  const subjects = currentSemester?.subjects || [];

  const handleSaveSession = async (data: Omit<ClassSession, "id" | "subjectName"> & { id?: string }) => {
    if (data.id) {
      await updateClassSession(data as ClassSession);
    } else {
      await addClassSession(data);
    }
  };

  const handleSaveEvent = async (data: Omit<AcademicEvent, "id" | "subjectName"> & { id?: string }) => {
    if (data.id) {
      await updateEvent(data as AcademicEvent);
    } else {
      await addEvent(data);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm("Delete this class?")) await deleteClassSession(id);
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Delete this event?")) await deleteEvent(id);
  };

  // ترتيب المحاضرات حسب اليوم
  const sortedSchedule = [...classSchedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

  if (semesters.length === 0) {
    return (
      <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-4">Calendar</h1>
        <p className="text-muted-foreground text-center py-10">
          Add a semester first from the Home tab to start scheduling.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
      <h1 className="text-2xl font-bold text-foreground mb-4">Calendar</h1>

      <Select
        value={selectedSemesterId}
        onChange={(e) => setSelectedSemesterId(e.target.value)}
        options={semesters.map((s) => ({ value: s.id, label: s.name }))}
      />

      <div className="flex gap-2 mt-4 mb-4">
        <button
          onClick={() => setTab("schedule")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "schedule" ? "bg-red-600 text-white" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          Weekly Schedule
        </button>
        <button
          onClick={() => setTab("events")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "events" ? "bg-red-600 text-white" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          Events
        </button>
      </div>

      {loading && <p className="text-center text-muted-foreground py-10">Loading...</p>}

      {!loading && tab === "schedule" && (
        <div className="space-y-3">
          {sortedSchedule.length === 0 && (
            <p className="text-center text-muted-foreground py-10">
              No classes scheduled yet. Tap + to add one.
            </p>
          )}
          {sortedSchedule.map((session) => (
            <div key={session.id}>
              <p className="text-xs text-muted-foreground font-medium mb-1 mt-3">
                {DAY_NAMES[session.dayOfWeek]}
              </p>
              <ClassSessionCard
                session={session}
                onEdit={(s) => {
                  setEditingSession(s);
                  setSessionModalOpen(true);
                }}
                onDelete={handleDeleteSession}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "events" && (
        <div className="space-y-3">
          {events.length === 0 && (
            <p className="text-center text-muted-foreground py-10">
              No events yet. Tap + to add one.
            </p>
          )}
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(e) => {
                setEditingEvent(e);
                setEventModalOpen(true);
              }}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (tab === "schedule") {
            setEditingSession(null);
            setSessionModalOpen(true);
          } else {
            setEditingEvent(null);
            setEventModalOpen(true);
          }
        }}
        className="fixed bottom-20 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-colors z-50"
        aria-label="Add"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ClassSessionFormModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSave={handleSaveSession}
        editingSession={editingSession}
        subjects={subjects}
        semesterId={selectedSemesterId}
      />

      <EventFormModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        subjects={subjects}
        semesterId={selectedSemesterId}
      />
    </main>
  );
}
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClassSession, AcademicEvent } from "./types";

interface CalendarContextType {
  classSchedule: ClassSession[];
  events: AcademicEvent[];
  loading: boolean;
  error: string | null;
  loadForSemester: (semesterId: string) => Promise<void>;
  addClassSession: (session: Omit<ClassSession, "id" | "subjectName">) => Promise<void>;
  updateClassSession: (session: ClassSession) => Promise<void>;
  deleteClassSession: (id: string) => Promise<void>;
  addEvent: (event: Omit<AcademicEvent, "id" | "subjectName">) => Promise<void>;
  updateEvent: (event: AcademicEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [classSchedule, setClassSchedule] = useState<ClassSession[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
  const supabase = createClient();

  const loadForSemester = async (semesterId: string) => {
    try {
      setError(null);
      setLoading(true);
      setCurrentSemesterId(semesterId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setClassSchedule([]);
        setEvents([]);
        setLoading(false);
        return;
      }

      const { data: scheduleData, error: scheduleError } = await supabase
        .from("class_schedule")
        .select("*, subjects(name)")
        .eq("semester_id", semesterId);

      if (scheduleError) {
        throw scheduleError;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from("academic_events")
        .select("*, subjects(name)")
        .eq("semester_id", semesterId)
        .order("event_date", { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      setClassSchedule(
        (scheduleData || []).map((s: any) => ({
          id: s.id,
          semesterId: s.semester_id,
          subjectId: s.subject_id,
          subjectName: s.subjects?.name || "Unknown",
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          location: s.location || "",
          sessionType: s.session_type,
          semesterEndDate: s.semester_end_date,
        }))
      );

      setEvents(
        (eventsData || []).map((e: any) => ({
          id: e.id,
          semesterId: e.semester_id,
          subjectId: e.subject_id,
          subjectName: e.subjects?.name || "Unknown",
          title: e.title,
          eventType: e.event_type,
          eventDate: e.event_date,
          eventTime: e.event_time,
        }))
      );
    } catch (err) {
      console.error("Error loading calendar data:", err);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addClassSession = async (session: Omit<ClassSession, "id" | "subjectName">) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to add a class");
        return;
      }

      const { error } = await supabase.from("class_schedule").insert({
        user_id: user.id,
        semester_id: session.semesterId,
        subject_id: session.subjectId,
        day_of_week: session.dayOfWeek,
        start_time: session.startTime,
        end_time: session.endTime,
        location: session.location,
        session_type: session.sessionType,
        semester_end_date: session.semesterEndDate,
      });

      if (error) {
        throw error;
      }

      if (currentSemesterId) await loadForSemester(currentSemesterId);
    } catch (err) {
      console.error("Error adding class session:", err);
      setError("Failed to add class. Please try again.");
    }
  };

  const updateClassSession = async (session: ClassSession) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("class_schedule")
        .update({
          subject_id: session.subjectId,
          day_of_week: session.dayOfWeek,
          start_time: session.startTime,
          end_time: session.endTime,
          location: session.location,
          session_type: session.sessionType,
          semester_end_date: session.semesterEndDate,
        })
        .eq("id", session.id);

      if (error) {
        throw error;
      }

      if (currentSemesterId) await loadForSemester(currentSemesterId);
    } catch (err) {
      console.error("Error updating class session:", err);
      setError("Failed to update class. Please try again.");
    }
  };

  const deleteClassSession = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase.from("class_schedule").delete().eq("id", id);

      if (error) {
        throw error;
      }

      if (currentSemesterId) await loadForSemester(currentSemesterId);
    } catch (err) {
      console.error("Error deleting class session:", err);
      setError("Failed to delete class. Please try again.");
    }
  };

  const addEvent = async (event: Omit<AcademicEvent, "id" | "subjectName">) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to add an event");
        return;
      }

      const { error } = await supabase.from("academic_events").insert({
        user_id: user.id,
        semester_id: event.semesterId,
        subject_id: event.subjectId,
        title: event.title,
        event_type: event.eventType,
        event_date: event.eventDate,
        event_time: event.eventTime,
      });

      if (error) {
        throw error;
      }

      if (currentSemesterId) await loadForSemester(currentSemesterId);
    } catch (err) {
      console.error("Error adding event:", err);
      setError("Failed to add event. Please try again.");
    }
  };

  const updateEvent = async (event: AcademicEvent) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("academic_events")
        .update({
          subject_id: event.subjectId,
          title: event.title,
          event_type: event.eventType,
          event_date: event.eventDate,
          event_time: event.eventTime,
        })
        .eq("id", event.id);

      if (error) {
        throw error;
      }

      if (currentSemesterId) await loadForSemester(currentSemesterId);
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event. Please try again.");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase.from("academic_events").delete().eq("id", id);

      if (error) {
        throw error;
      }

      if (currentSemesterId) await loadForSemester(currentSemesterId);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        classSchedule,
        events,
        loading,
        error,
        loadForSemester,
        addClassSession,
        updateClassSession,
        deleteClassSession,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used inside CalendarProvider");
  }
  return context;
}
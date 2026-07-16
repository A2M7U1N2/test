"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClassSession, AcademicEvent } from "./types";

interface CalendarContextType {
  classSchedule: ClassSession[];
  events: AcademicEvent[];
  loading: boolean;
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
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
  const supabase = createClient();

  const loadForSemester = async (semesterId: string) => {
    setLoading(true);
    setCurrentSemesterId(semesterId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setClassSchedule([]);
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data: scheduleData } = await supabase
      .from("class_schedule")
      .select("*, subjects(name)")
      .eq("semester_id", semesterId);

    const { data: eventsData } = await supabase
      .from("academic_events")
      .select("*, subjects(name)")
      .eq("semester_id", semesterId)
      .order("event_date", { ascending: true });

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

    setLoading(false);
  };

  const addClassSession = async (session: Omit<ClassSession, "id" | "subjectName">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("class_schedule").insert({
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

    if (currentSemesterId) await loadForSemester(currentSemesterId);
  };

  const updateClassSession = async (session: ClassSession) => {
    await supabase
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

    if (currentSemesterId) await loadForSemester(currentSemesterId);
  };

  const deleteClassSession = async (id: string) => {
    await supabase.from("class_schedule").delete().eq("id", id);
    if (currentSemesterId) await loadForSemester(currentSemesterId);
  };

  const addEvent = async (event: Omit<AcademicEvent, "id" | "subjectName">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("academic_events").insert({
      user_id: user.id,
      semester_id: event.semesterId,
      subject_id: event.subjectId,
      title: event.title,
      event_type: event.eventType,
      event_date: event.eventDate,
      event_time: event.eventTime,
    });

    if (currentSemesterId) await loadForSemester(currentSemesterId);
  };

  const updateEvent = async (event: AcademicEvent) => {
    await supabase
      .from("academic_events")
      .update({
        subject_id: event.subjectId,
        title: event.title,
        event_type: event.eventType,
        event_date: event.eventDate,
        event_time: event.eventTime,
      })
      .eq("id", event.id);

    if (currentSemesterId) await loadForSemester(currentSemesterId);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("academic_events").delete().eq("id", id);
    if (currentSemesterId) await loadForSemester(currentSemesterId);
  };

  return (
    <CalendarContext.Provider
      value={{
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
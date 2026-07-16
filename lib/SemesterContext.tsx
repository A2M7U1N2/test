"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Semester, Subject } from "./types";

interface SemesterContextType {
  semesters: Semester[];
  loading: boolean;
  addSemester: (name: string) => Promise<void>;
  updateSemester: (id: string, updates: Partial<Semester>) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  addSubject: (semesterId: string, subject: Omit<Subject, "id">) => Promise<void>;
  updateSubject: (semesterId: string, subject: Subject) => Promise<void>;
  deleteSubject: (semesterId: string, subjectId: string) => Promise<void>;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // تحميل الترمات والمواد بتاعت المستخدم المسجل دخوله
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSemesters([]);
      setLoading(false);
      return;
    }

    const { data: semestersData } = await supabase
      .from("semesters")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*");

    const combined: Semester[] = (semestersData || []).map((sem) => ({
      id: sem.id,
      name: sem.name,
      completed: sem.completed,
      subjects: (subjectsData || [])
        .filter((sub) => sub.semester_id === sem.id)
        .map((sub) => ({
          id: sub.id,
          name: sub.name,
          grade: sub.grade,
          gradePoint: parseFloat(sub.grade_point),
          credits: parseFloat(sub.credits),
        })),
    }));

    setSemesters(combined);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addSemester = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("semesters").insert({
      name,
      user_id: user.id,
      completed: false,
    });

    await loadData();
  };

  const updateSemester = async (id: string, updates: Partial<Semester>) => {
    await supabase
      .from("semesters")
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.completed !== undefined && { completed: updates.completed }),
      })
      .eq("id", id);

    await loadData();
  };

  const deleteSemester = async (id: string) => {
    await supabase.from("semesters").delete().eq("id", id);
    await loadData();
  };

  const addSubject = async (semesterId: string, subject: Omit<Subject, "id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("subjects").insert({
      semester_id: semesterId,
      user_id: user.id,
      name: subject.name,
      grade: subject.grade,
      grade_point: subject.gradePoint,
      credits: subject.credits,
    });

    await loadData();
  };

  const updateSubject = async (semesterId: string, subject: Subject) => {
    await supabase
      .from("subjects")
      .update({
        name: subject.name,
        grade: subject.grade,
        grade_point: subject.gradePoint,
        credits: subject.credits,
      })
      .eq("id", subject.id);

    await loadData();
  };

  const deleteSubject = async (semesterId: string, subjectId: string) => {
    await supabase.from("subjects").delete().eq("id", subjectId);
    await loadData();
  };

  return (
    <SemesterContext.Provider
      value={{
        semesters,
        loading,
        addSemester,
        updateSemester,
        deleteSemester,
        addSubject,
        updateSubject,
        deleteSubject,
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemesters() {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error("useSemesters must be used inside SemesterProvider");
  }
  return context;
}
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Semester, Subject } from "./types";

interface SemesterContextType {
  semesters: Semester[];
  loading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // تحميل الترمات والمواد بتاعت المستخدم المسجل دخوله
  const loadData = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSemesters([]);
        setLoading(false);
        return;
      }

      const { data: semestersData, error: semestersError } = await supabase
        .from("semesters")
        .select("*")
        .order("created_at", { ascending: false });

      if (semestersError) {
        throw semestersError;
      }

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*");

      if (subjectsError) {
        throw subjectsError;
      }

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
    } catch (err) {
      console.error("Error loading semesters:", err);
      setError("Failed to load your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addSemester = async (name: string) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to add a semester");
        return;
      }

      const { error } = await supabase.from("semesters").insert({
        name,
        user_id: user.id,
        completed: false,
      });

      if (error) {
        throw error;
      }

      await loadData();
    } catch (err) {
      console.error("Error adding semester:", err);
      setError("Failed to add semester. Please try again.");
    }
  };

  const updateSemester = async (id: string, updates: Partial<Semester>) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("semesters")
        .update({
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.completed !== undefined && { completed: updates.completed }),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (err) {
      console.error("Error updating semester:", err);
      setError("Failed to update semester. Please try again.");
    }
  };

  const deleteSemester = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase.from("semesters").delete().eq("id", id);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (err) {
      console.error("Error deleting semester:", err);
      setError("Failed to delete semester. Please try again.");
    }
  };

  const addSubject = async (semesterId: string, subject: Omit<Subject, "id">) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to add a subject");
        return;
      }

      const { error } = await supabase.from("subjects").insert({
        semester_id: semesterId,
        user_id: user.id,
        name: subject.name,
        grade: subject.grade,
        grade_point: subject.gradePoint,
        credits: subject.credits,
      });

      if (error) {
        throw error;
      }

      await loadData();
    } catch (err) {
      console.error("Error adding subject:", err);
      setError("Failed to add subject. Please try again.");
    }
  };

  const updateSubject = async (semesterId: string, subject: Subject) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("subjects")
        .update({
          name: subject.name,
          grade: subject.grade,
          grade_point: subject.gradePoint,
          credits: subject.credits,
        })
        .eq("id", subject.id);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (err) {
      console.error("Error updating subject:", err);
      setError("Failed to update subject. Please try again.");
    }
  };

  const deleteSubject = async (semesterId: string, subjectId: string) => {
    try {
      setError(null);
      const { error } = await supabase.from("subjects").delete().eq("id", subjectId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (err) {
      console.error("Error deleting subject:", err);
      setError("Failed to delete subject. Please try again.");
    }
  };

  return (
    <SemesterContext.Provider
      value={{
        semesters,
        loading,
        error,
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
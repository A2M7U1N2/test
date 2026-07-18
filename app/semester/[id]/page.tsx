"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSemesters } from "@/lib/SemesterContext";
import { calculateSemesterGPA, calculateSemesterCredits } from "@/lib/gpaCalculations";
import { GpaHeroCard } from "@/components/gpa/GpaHeroCard";
import { SubjectCard } from "@/components/gpa/SubjectCard";
import { SubjectFormModal } from "@/components/gpa/SubjectFormModal";
import { Subject } from "@/lib/types";
import { ChevronLeft, Plus } from "lucide-react";

export default function SemesterDetail() {
  const router = useRouter();
  const params = useParams();
  const semesterId = params.id as string;

  const { semesters, updateSemester, addSubject, updateSubject, deleteSubject } = useSemesters();
  const semester = semesters.find((s) => s.id === semesterId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  if (!semester) {
    return (
      <main className="max-w-2xl mx-auto p-5">
        <p className="text-muted-foreground">Semester not found.</p>
        <button onClick={() => router.push("/")} className="text-red-500 mt-2">
          Go back
        </button>
      </main>
    );
  }

  const gpa = calculateSemesterGPA(semester.subjects);
  const credits = calculateSemesterCredits(semester.subjects);

  const handleSaveSubject = async (data: Omit<Subject, "id"> & { id?: string }) => {
    if (data.id) {
      await updateSubject(semesterId, data as Subject);
    } else {
      await addSubject(semesterId, data);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Delete this subject?")) {
      await deleteSubject(semesterId, id);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push("/")}
          className="p-2 bg-card border border-border rounded-full text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{semester.name}</h1>
      </div>

      <GpaHeroCard
        title="Semester GPA"
        gpa={gpa}
        maxGpa={4.0}
        stats={[
          { label: "Credits", value: credits },
          { label: "Subjects", value: semester.subjects.length },
        ]}
        extra={
          <div className="flex items-center justify-between bg-black/15 rounded-lg px-3 py-2">
            <span className="text-sm font-medium text-white">Completed</span>
            <button
              onClick={async () =>
                await updateSemester(semester.id, { completed: !semester.completed })
              }
              className={`w-11 h-6 rounded-full transition-colors relative overflow-hidden ${
                semester.completed ? "bg-green-500" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                  semester.completed ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        }
      />

      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
        <span className="text-sm text-muted-foreground">{semester.subjects.length} Total</span>
      </div>

      <div className="space-y-3">
        {semester.subjects.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No subjects yet. Tap + to add one.
          </p>
        )}
        {semester.subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onEdit={(s) => {
              setEditingSubject(s);
              setModalOpen(true);
            }}
            onDelete={handleDeleteSubject}
          />
        ))}
      </div>

      <button
        onClick={() => {
          setEditingSubject(null);
          setModalOpen(true);
        }}
        className="fixed bottom-20 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-colors z-50"
        aria-label="Add Subject"
      >
        <Plus className="h-6 w-6" />
      </button>

      <SubjectFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSubject}
        editingSubject={editingSubject}
      />
    </main>
  );
}
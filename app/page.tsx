"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSemesters } from "@/lib/SemesterContext";
import { isProfileComplete } from "@/actions/profile";
import { calculateCumulativeGPA, calculateTotalCredits } from "@/lib/gpaCalculations";
import { GpaHeroCard } from "@/components/gpa/GpaHeroCard";
import { SemesterCard } from "@/components/gpa/SemesterCard";
import { SemesterFormModal } from "@/components/gpa/SemesterFormModal";
import { Semester } from "@/lib/types";
import { Plus } from "lucide-react";


export default function Home() {
  const router = useRouter();
  const { semesters, loading, addSemester, updateSemester, deleteSemester } = useSemesters();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const check = async () => {
      const complete = await isProfileComplete();
      if (!complete) {
        router.push("/profile?onboarding=true");
        return;
      }
      setCheckingProfile(false);
    };
    check();
  }, [router]);

  const cumulativeGPA = calculateCumulativeGPA(semesters);
  const totalCredits = calculateTotalCredits(semesters);

  const handleSave = async (name: string, id?: string) => {
    if (id) {
      await updateSemester(id, { name });
    } else {
      await addSemester(name);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this semester?")) {
      await deleteSemester(id);
    }
  };

  if (checkingProfile) {
    return (
      <main className="max-w-2xl mx-auto p-5">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Welcome Back,</p>
        <h1 className="text-2xl font-bold text-foreground">My Semesters</h1>
      </div>

      <GpaHeroCard
        title="Cumulative GPA"
        gpa={cumulativeGPA}
        maxGpa={4.0}
        stats={[
          { label: "Total Credits", value: totalCredits },
          { label: "Total Semesters", value: semesters.length },
        ]}
      />

      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-lg font-semibold text-foreground">Recent Semesters</h2>
      </div>

      <div className="space-y-3">
        {loading && (
          <p className="text-center text-muted-foreground py-10">Loading...</p>
        )}
        {!loading && semesters.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No semesters yet. Tap + to add one.
          </p>
        )}
        {semesters.map((semester) => (
          <SemesterCard
            key={semester.id}
            semester={semester}
            onOpen={(id) => router.push(`/semester/${id}`)}
            onEdit={(s) => {
              setEditingSemester(s);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <button
        onClick={() => {
          setEditingSemester(null);
          setModalOpen(true);
        }}
        className="fixed bottom-20 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-colors z-50"
        aria-label="Add Semester"
      >
        <Plus className="h-6 w-6" />
      </button>

      <SemesterFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingSemester={editingSemester}
      />
    </main>
  );
}
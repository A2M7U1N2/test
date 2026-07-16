"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProfile, updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ChevronLeft } from "lucide-react";

const YEAR_OPTIONS = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5th Year", label: "5th Year" },
];

// 1. عملنا الـ Component ده عشان يحتوي على الـ Form والـ searchParams
function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("1st Year");

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();
      if (profile) {
        setFullName(profile.full_name || "");
        setUniversity(profile.university || "");
        setFaculty(profile.faculty || "");
        setDepartment(profile.department || "");
        setAcademicYear(profile.academic_year || "1st Year");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setSaved(false);
    setError("");
    const result = await updateProfile(formData);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      console.error("Profile save error:", result.error);
      return;
    }
    if (isOnboarding) {
      router.push("/");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-5">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
      <div className="flex items-center gap-3 mb-6">
        {!isOnboarding && (
          <button
            onClick={() => router.push("/")}
            className="p-2 bg-card border border-border rounded-full text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isOnboarding ? "Welcome! Let's get started" : "Student Profile"}
          </h1>
          {isOnboarding && (
            <p className="text-sm text-muted-foreground mt-1">
              Fill in your details to continue
            </p>
          )}
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <Input
          name="fullName"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Mark Atef"
          required
        />
        <Input
          name="university"
          label="University"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder="e.g. Alexandria National University"
          required
        />
        <Input
          name="faculty"
          label="Faculty"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          placeholder="e.g. Engineering"
          required
        />
        <Input
          name="department"
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Computer & Communications"
          required
        />
        <Select
          name="academicYear"
          label="Academic Year"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          options={YEAR_OPTIONS}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Profile"}
        </Button>
      </form>
    </main>
  );
}

// 2. الصفحة الرئيسية دلوقتي بقت مجرد حاوية آمنة لـ Suspense عشان الـ Build يعدي
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="max-w-2xl mx-auto p-5">
        <p className="text-muted-foreground">Loading profile template...</p>
      </main>
    }>
      <ProfileForm />
    </Suspense>
  );
}
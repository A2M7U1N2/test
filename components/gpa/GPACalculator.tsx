"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Plus, Trash2, Calculator } from "lucide-react";

type GradingScaleType = "4.0" | "4.3" | "5.0" | "percentage" | "custom";

interface GradingScale {
  type: GradingScaleType;
  customMap?: Record<string, number>;
}

interface CourseEntry {
  id: string;
  courseName: string;
  credits: number;
  grade: string;
}

interface Props {
  initialCurrentGPA?: number;
  initialTotalCredits?: number;
}

const DEFAULT_SCALES: Record<Exclude<GradingScaleType, "custom">, Record<string, number>> = {
  "4.0": { "A": 4.0, "B": 3.0, "C": 2.0, "D": 1.0, "F": 0.0 },
  "4.3": {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "F": 0.0
  },
  "5.0": { "A": 5.0, "B": 4.0, "C": 3.0, "D": 2.0, "F": 0.0 },
  "percentage": {},
};

let idCounter = 0;
const generateId = () => `entry-${++idCounter}-${Date.now()}`;

export function GPACalculator({ initialCurrentGPA, initialTotalCredits }: Props) {
  const [entries, setEntries] = useState<CourseEntry[]>([
    { id: generateId(), courseName: "", credits: 3, grade: "" },
  ]);
  const [scaleType, setScaleType] = useState<GradingScaleType>("4.0");
  const [customMap, setCustomMap] = useState<Record<string, number>>({});
  const [previousGPA, setPreviousGPA] = useState<number>(initialCurrentGPA || 0);
  const [previousCredits, setPreviousCredits] = useState<number>(initialTotalCredits || 0);
  const [semesterGPA, setSemesterGPA] = useState<number | null>(null);
  const [cumulativeGPA, setCumulativeGPA] = useState<number | null>(null);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [newCustomLetter, setNewCustomLetter] = useState("");
  const [newCustomPoint, setNewCustomPoint] = useState("");

  // Dynamically build grade options based on selected scale
  const gradeOptions = useMemo(() => {
    if (scaleType === "percentage") return [];

    if (scaleType === "custom") {
      // Return the user-defined custom letters
      return Object.keys(customMap).map((letter) => ({
        value: letter,
        label: letter,
      }));
    }

    // Predefined scales
    const grades = Object.keys(DEFAULT_SCALES[scaleType as Exclude<GradingScaleType, "custom" | "percentage">]);
    return grades.map((grade) => ({ value: grade, label: grade }));
  }, [scaleType, customMap]);

  // Ensure a "Select a grade" placeholder option is prepended
  const selectOptions = useMemo(() => {
    if (scaleType === "percentage") return []; // not used
    return [
      { value: "", label: scaleType === "custom" ? "Choose letter" : "Select grade" },
      ...gradeOptions,
    ];
  }, [gradeOptions, scaleType]);

  const getGradePoint = (grade: string, scale: GradingScale): number => {
    if (!grade.trim()) return 0;
    const g = grade.trim().toUpperCase();

    if (scale.type === "percentage") {
      const percent = parseFloat(g);
      if (isNaN(percent)) return 0;
      if (percent >= 90) return 4.0;
      if (percent >= 80) return 3.0;
      if (percent >= 70) return 2.0;
      if (percent >= 60) return 1.0;
      return 0.0;
    }

    if (scale.type === "custom") {
      return scale.customMap?.[g] ?? 0;
    }

    return DEFAULT_SCALES[scale.type]?.[g] ?? 0;
  };

  const addEntry = () => {
    setEntries([...entries, { id: generateId(), courseName: "", credits: 3, grade: "" }]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof CourseEntry, value: string | number) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addCustomGrade = () => {
    const letter = newCustomLetter.trim().toUpperCase();
    const point = parseFloat(newCustomPoint);
    if (letter && !isNaN(point) && point >= 0) {
      setCustomMap({ ...customMap, [letter]: point });
      setNewCustomLetter("");
      setNewCustomPoint("");
    }
  };

  const removeCustomGrade = (letter: string) => {
    const updated = { ...customMap };
    delete updated[letter];
    setCustomMap(updated);
  };

  const calculate = () => {
    const scale: GradingScale = scaleType === "custom"
      ? { type: "custom", customMap }
      : { type: scaleType };

    let totalPoints = 0;
    let totalCredits = 0;

    for (const entry of entries) {
      const credits = parseFloat(entry.credits.toString()) || 0;
      const point = getGradePoint(entry.grade, scale);
      totalPoints += credits * point;
      totalCredits += credits;
    }

    const semGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setSemesterGPA(parseFloat(semGPA.toFixed(2)));

    const prevCred = parseFloat(previousCredits.toString()) || 0;
    const prevGPA = parseFloat(previousGPA.toString()) || 0;
    const totalNewCredits = totalCredits;

    if (prevCred + totalNewCredits > 0) {
      const cumGPA = (prevCred * prevGPA + totalNewCredits * semGPA) / (prevCred + totalNewCredits);
      setCumulativeGPA(parseFloat(cumGPA.toFixed(2)));
    } else {
      setCumulativeGPA(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Grading System Selection */}
      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">
          Grading System
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={scaleType}
            onChange={(e) => {
              const val = e.target.value as GradingScaleType;
              setScaleType(val);
              setShowCustomEditor(false);
            }}
            options={[
              { value: "4.0", label: "4.0 (A,B,C,D,F)" },
              { value: "4.3", label: "4.3 (+/-)" },
              { value: "5.0", label: "5.0 Scale" },
              { value: "percentage", label: "Percentage" },
              { value: "custom", label: "Custom" },
            ]}
          />
          {scaleType === "custom" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomEditor(!showCustomEditor)}
            >
              {showCustomEditor ? "Hide Custom" : "Edit Custom Scale"}
            </Button>
          )}
        </div>

        {/* Custom scale editor */}
        {scaleType === "custom" && showCustomEditor && (
          <div className="mt-4 space-y-3 border-t pt-3">
            <div className="flex gap-2 items-end">
              <Input
                label="Letter"
                value={newCustomLetter}
                onChange={(e) => setNewCustomLetter(e.target.value)}
                className="w-24"
                maxLength={2}
              />
              <Input
                label="Points"
                type="number"
                step="0.1"
                value={newCustomPoint}
                onChange={(e) => setNewCustomPoint(e.target.value)}
                className="w-24"
              />
              <Button onClick={addCustomGrade} size="sm">
                Add
              </Button>
            </div>
            {Object.keys(customMap).length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                {Object.entries(customMap).map(([letter, point]) => (
                  <div
                    key={letter}
                    className="flex items-center justify-between bg-accent rounded p-1 px-2 text-sm"
                  >
                    <span>{letter} = {point}</span>
                    <button
                      onClick={() => removeCustomGrade(letter)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Course entries */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Semester Courses</h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-end gap-3 border-b pb-3"
            >
              <div className="flex-1 min-w-[150px]">
                <Input
                  label="Course Name"
                  value={entry.courseName}
                  onChange={(e) =>
                    updateEntry(entry.id, "courseName", e.target.value)
                  }
                  placeholder="e.g. Calculus 1"
                />
              </div>
              <div className="w-24">
                <Input
                  label="Credits"
                  type="number"
                  min="0"
                  step="0.5"
                  value={entry.credits}
                  onChange={(e) =>
                    updateEntry(entry.id, "credits", e.target.value)
                  }
                />
              </div>
              <div className="w-28">
                {scaleType === "percentage" ? (
                  <Input
                    label="Grade %"
                    type="number"
                    min="0"
                    max="100"
                    value={entry.grade}
                    onChange={(e) =>
                      updateEntry(entry.id, "grade", e.target.value)
                    }
                  />
                ) : (
                  <Select
                    label="Grade"
                    value={entry.grade}
                    onChange={(e) =>
                      updateEntry(entry.id, "grade", e.target.value)
                    }
                    options={selectOptions}
                  />
                )}
              </div>
              <div className="flex items-end pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={addEntry}>
          <Plus className="mr-1 h-4 w-4" /> Add Course Entry
        </Button>
      </Card>

      {/* Previous records & calculation */}
      <Card className="p-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Input
            label="Previous GPA"
            type="number"
            step="0.01"
            min="0"
            value={previousGPA}
            onChange={(e) => setPreviousGPA(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Input
            label="Previous Credits"
            type="number"
            step="0.5"
            min="0"
            value={previousCredits}
            onChange={(e) => setPreviousCredits(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={calculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate
          </Button>
        </div>
      </Card>

      {/* Results */}
      {(semesterGPA !== null || cumulativeGPA !== null) && (
        <Card className="p-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Semester GPA</span>
            <p className="text-3xl font-bold">
              {semesterGPA?.toFixed(2) ?? "—"}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Cumulative GPA</span>
            <p className="text-3xl font-bold">
              {cumulativeGPA?.toFixed(2) ?? "—"}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
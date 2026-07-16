import { Semester, Subject } from "./types";

// بيحسب الـ GPA بتاع ترم واحد بس، من المواد اللي جواه
export function calculateSemesterGPA(subjects: Subject[]): number {
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits === 0) return 0;

  const totalPoints = subjects.reduce(
    (sum, s) => sum + s.gradePoint * s.credits,
    0
  );

  return parseFloat((totalPoints / totalCredits).toFixed(2));
}

// بيحسب إجمالي الساعات المعتمدة في ترم واحد
export function calculateSemesterCredits(subjects: Subject[]): number {
  return subjects.reduce((sum, s) => sum + s.credits, 0);
}

// بيحسب الـ Cumulative GPA من كل الترمات مع بعض
export function calculateCumulativeGPA(semesters: Semester[]): number {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const semester of semesters) {
    for (const subject of semester.subjects) {
      totalCredits += subject.credits;
      totalPoints += subject.gradePoint * subject.credits;
    }
  }

  if (totalCredits === 0) return 0;
  return parseFloat((totalPoints / totalCredits).toFixed(2));
}

// بيحسب إجمالي الساعات المعتمدة في كل الترمات مع بعض
export function calculateTotalCredits(semesters: Semester[]): number {
  return semesters.reduce(
    (sum, s) => sum + calculateSemesterCredits(s.subjects),
    0
  );
}
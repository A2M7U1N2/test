"use client";

import { getGpaColor } from "@/lib/gpaColor";
import { Share } from "lucide-react";

interface Props {
  title: string;        // "Cumulative GPA" أو "Semester GPA"
  gpa: number;
  maxGpa?: number;
  stats: { label: string; value: string | number }[];
  showExport?: boolean;
  onExport?: () => void;
  extra?: React.ReactNode; // مكان لأي حاجة زيادة زي سويتش الـ Completed
}

export function GpaHeroCard({
  title,
  gpa,
  maxGpa = 4.0,
  stats,
  showExport = false,
  onExport,
  extra,
}: Props) {
  const bgColor = getGpaColor(gpa, maxGpa);

  return (
    <div
      className="rounded-2xl p-5 transition-colors duration-500"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
          {title}
        </p>
        {showExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white"
          >
            <Share className="h-4 w-4" />
            Export
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-5xl font-bold text-white">{gpa.toFixed(2)}</p>
        <p className="text-lg text-white/70">/ {maxGpa.toFixed(1)}</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {stats.map((stat) => (
          <span
            key={stat.label}
            className="bg-black/15 text-white text-xs font-medium px-3 py-1.5 rounded-full"
          >
            {stat.label}: {stat.value}
          </span>
        ))}
      </div>

      {extra && <div className="mt-4">{extra}</div>}
    </div>
  );
}
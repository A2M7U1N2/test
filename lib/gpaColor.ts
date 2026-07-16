// بيحسب لون الكارت تدريجياً من أحمر لبرتقالي لأخضر حسب نسبة الـ GPA
export function getGpaColor(gpa: number, maxGpa: number = 4.0): string {
  const percent = Math.max(0, Math.min(1, gpa / maxGpa));

  // الألوان: أحمر (0%) -> برتقالي (50%) -> أخضر (100%)
  const red = { r: 239, g: 68, b: 68 };     // #ef4444
  const orange = { r: 249, g: 115, b: 22 }; // #f97316
  const green = { r: 34, g: 197, b: 94 };   // #22c55e

  let start, end, localPercent;

  if (percent <= 0.5) {
    start = red;
    end = orange;
    localPercent = percent / 0.5;
  } else {
    start = orange;
    end = green;
    localPercent = (percent - 0.5) / 0.5;
  }

  const r = Math.round(start.r + (end.r - start.r) * localPercent);
  const g = Math.round(start.g + (end.g - start.g) * localPercent);
  const b = Math.round(start.b + (end.b - start.b) * localPercent);

  return `rgb(${r}, ${g}, ${b})`;
}
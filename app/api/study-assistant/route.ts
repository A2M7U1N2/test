import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STUDY_INSTRUCTIONS = `You are StudyOS, a focused academic tutor. Help only with studying, courses, assignments, exam preparation, and academic planning. Adapt to mathematics, programming, sciences, languages, humanities, geography, and university courses. Teach in the user's language. For problem solving, guide with a small hint and clear steps before giving a final answer. Be concise, accurate, encouraging, and say when the supplied context is insufficient.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY to .env.local, then restart the server." }, { status: 503 });
  }

  const body = await request.json() as { message?: string; course?: string; semester?: string; mode?: string };
  if (!body.message?.trim()) return NextResponse.json({ error: "Write a study question first." }, { status: 400 });

  const context = [
    body.semester && `Semester: ${body.semester}`,
    body.course && `Course: ${body.course}`,
    body.mode && `Study mode: ${body.mode}`,
  ].filter(Boolean).join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5",
      instructions: STUDY_INSTRUCTIONS,
      input: `${context}\n\nStudent question: ${body.message}`,
    }),
  });

  if (!response.ok) return NextResponse.json({ error: "The study assistant could not answer right now." }, { status: 502 });
  const data = await response.json() as { output_text?: string };
  return NextResponse.json({ answer: data.output_text ?? "I could not generate an answer." });
}

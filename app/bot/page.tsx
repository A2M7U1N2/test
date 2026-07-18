"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { useSemesters } from "@/lib/SemesterContext";

type Message = { role: "student" | "assistant"; text: string };
const MODES = ["Explain", "Solve with me", "Quiz me", "Make a plan", "Summarize"];

export default function BotPage() {
  const { semesters, loading } = useSemesters();
  const [semesterId, setSemesterId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [mode, setMode] = useState(MODES[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Hi! I’m your StudyOS tutor. Choose a course, then ask me to explain, quiz you, solve with you, or make a study plan." }]);

  const selectedSemester = useMemo(() => semesters.find((semester) => semester.id === semesterId) ?? semesters[0], [semesters, semesterId]);
  const courses = selectedSemester?.subjects ?? [];

  async function send(event: FormEvent) {
    event.preventDefault();
    const question = message.trim();
    if (!question || sending) return;
    setMessage(""); setSending(true);
    setMessages((current) => [...current, { role: "student", text: question }]);
    try {
      const result = await fetch("/api/study-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, mode, semester: selectedSemester?.name, course: courses.find((course) => course.id === courseId)?.name }) });
      const data = await result.json() as { answer?: string; error?: string };
      setMessages((current) => [...current, { role: "assistant", text: data.answer ?? data.error ?? "Something went wrong." }]);
    } catch { setMessages((current) => [...current, { role: "assistant", text: "I could not reach the study assistant. Please try again." }]); }
    finally { setSending(false); }
  }

  return <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
    <div className="flex gap-3 items-center mb-5"><div className="rounded-xl bg-red-600 p-3 text-white"><Bot /></div><div><h1 className="text-2xl font-bold">Study Bot</h1><p className="text-sm text-muted-foreground">Your focused tutor for every subject.</p></div></div>
    <div className="grid grid-cols-2 gap-3 mb-3"><select value={selectedSemester?.id ?? ""} onChange={(e) => { setSemesterId(e.target.value); setCourseId(""); }} className="h-10 rounded-lg border border-border bg-card px-3 text-sm"><option value="">Select semester</option>{semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</select><select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm" disabled={!courses.length}><option value="">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></div>
    <div className="flex gap-2 overflow-x-auto pb-3">{MODES.map((item) => <button key={item} onClick={() => setMode(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${mode === item ? "bg-red-600 text-white" : "bg-card border border-border text-muted-foreground"}`}>{item}</button>)}</div>
    <section className="min-h-[360px] rounded-2xl border border-border bg-card p-4 space-y-3">{loading ? <p className="text-muted-foreground">Loading your courses…</p> : messages.map((item, index) => <div key={index} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${item.role === "student" ? "ml-auto bg-red-600 text-white" : "bg-background border border-border text-foreground"}`}>{item.role === "assistant" && <Sparkles className="inline h-4 w-4 mr-2 text-red-500" />}{item.text}</div>)}{sending && <p className="text-sm text-muted-foreground">Thinking…</p>}</section>
    <form onSubmit={send} className="mt-3 flex gap-2"><input value={message} onChange={(e) => setMessage(e.target.value)} className="h-12 flex-1 rounded-xl border border-border bg-card px-4 text-sm" placeholder={`Ask StudyOS to ${mode.toLowerCase()}…`} /><button disabled={sending} className="rounded-xl bg-red-600 px-4 text-white disabled:opacity-50" aria-label="Send"><Send className="h-5 w-5" /></button></form>
  </main>;
}

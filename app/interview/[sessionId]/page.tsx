"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppShell from "@/components/AppShell";
import QuestionCard from "@/components/QuestionCard";
import FeedbackPanel from "@/components/FeedbackPanel";
import ProgressBar from "@/components/ProgressBar";

type Feedback = { score: number; strengths: string[]; improvements: string[] };
type Summary = { overallScore: number; summary: string; topImprovements: string[] };
type Msg =
  | { id: number; kind: "mentor"; text: string; difficulty: string; number: number }
  | { id: number; kind: "you"; text: string }
  | { id: number; kind: "feedback"; feedback: Feedback };

async function api(path: string, method: "GET" | "POST", body?: unknown) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

function InterviewContent() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(6);
  const [answer, setAnswer] = useState("");
  const [thread, setThread] = useState<Msg[]>([]);
  const [allAnswered, setAllAnswered] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the session (and redirect to login if signed out)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const s = await api(`/api/interview/session?id=${sessionId}`, "GET");
        setRole(s.role);
        setLevel(s.level);
        setTotal(s.totalQuestions);
        setAnswered(s.answeredCount);
        if (s.status === "completed") {
          setSummary({
            overallScore: s.overallScore,
            summary: s.summary,
            topImprovements: s.topImprovements,
          });
        } else if (s.answeredCount >= s.totalQuestions) {
          setAllAnswered(true);
        } else {
          setThread([
            {
              id: ++idRef.current,
              kind: "mentor",
              text: s.currentQuestion,
              difficulty: s.currentDifficulty,
              number: s.answeredCount + 1,
            },
          ]);
        }
      } catch (e: any) {
        setError(e.message);
      }
      setReady(true);
    });
    return () => unsub();
  }, [sessionId, router]);

  // Keep the newest message in view (scrolls the chat box only)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread, loading]);

  async function handleSubmit() {
    const text = answer.trim();
    if (!text || loading) return;
    setError("");
    setLoading(true);
    setThread((t) => [...t, { id: ++idRef.current, kind: "you", text }]);
    setAnswer("");
    try {
      const r = await api("/api/interview/answer", "POST", { sessionId, answer: text });
      const newAnswered = answered + 1;
      const added: Msg[] = [{ id: ++idRef.current, kind: "feedback", feedback: r.feedback }];
      if (!r.done) {
        added.push({
          id: ++idRef.current,
          kind: "mentor",
          text: r.nextQuestion,
          difficulty: r.difficulty,
          number: newAnswered + 1,
        });
      }
      setAnswered(newAnswered);
      setThread((t) => [...t, ...added]);
      if (r.done) setAllAnswered(true);
    } catch (e: any) {
      setError(e.message);
      setThread((t) => t.slice(0, -1)); // remove the optimistic answer bubble
      setAnswer(text); // give the text back so nothing is lost
    }
    setLoading(false);
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      setSummary(await api("/api/interview/finish", "POST", { sessionId }));
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  if (!ready) return <p className="p-6">Loading...</p>;

  // Final summary screen
  if (summary) {
    return (
      <AppShell>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl">
            <h1 className="display text-5xl sm:text-6xl">
              Interview
              <br />
              complete
            </h1>
            <p className="mt-3 text-sm text-ink/70">{role} · {level}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-brand p-5 text-white">
                <p className="text-sm">Overall score</p>
                <p className="mt-6 text-5xl font-light">{summary.overallScore}/10</p>
              </div>
              <div className="rounded-3xl bg-white p-5 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">Summary</p>
                <p className="mt-3">{summary.summary}</p>
              </div>
            </div>

            <div className="mt-3 rounded-3xl bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">
                Top areas to improve
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                {summary.topImprovements.map((t, i) => (
                  <li key={i} className="rounded-2xl bg-butter p-4 text-sm">{t}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/interview/new" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
                New interview
              </Link>
              <Link href="/history" className="rounded-full border border-ink/30 px-6 py-3 text-sm font-medium hover:bg-white">
                History
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const rightPanel = (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl bg-white p-5">
        <p className="text-xs text-ink/60">Interview</p>
        <p className="mt-2 text-lg">{role}</p>
        <p className="text-sm text-ink/60">{level}</p>
      </div>

      <div className="rounded-3xl bg-white p-3">
        <ul className="flex flex-col gap-2">
          {Array.from({ length: total }, (_, i) => {
            const done = i < answered;
            const current = i === answered && !allAnswered;
            return (
              <li
                key={i}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                  current ? "bg-brand text-white" : done ? "bg-ice" : "bg-cloud"
                }`}
              >
                <span>Question {i + 1}</span>
                <span className="text-xs">{done ? "✓ Done" : current ? "In progress" : "Upcoming"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-3xl bg-butter p-5 text-sm">
        Tip: explain your reasoning and give a short example. Specific answers score higher.
      </div>
    </div>
  );

  return (
    <AppShell right={rightPanel}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white/60">
        <header className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="display text-2xl sm:text-3xl">{role}</h1>
            <p className="mt-1 text-xs text-ink/60">
              {level} · Question {Math.min(answered + (allAnswered ? 0 : 1), total)} of {total}
            </p>
          </div>
          <div className="w-32 sm:w-40">
            <ProgressBar current={answered} total={total} />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            {thread.map((m) =>
              m.kind === "mentor" ? (
                <QuestionCard
                  key={m.id}
                  question={m.text}
                  difficulty={m.difficulty}
                  number={m.number}
                  total={total}
                />
              ) : m.kind === "you" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-ice px-5 py-4 text-sm">
                    {m.text}
                  </div>
                </div>
              ) : (
                <FeedbackPanel key={m.id} {...m.feedback} />
              )
            )}

            {loading && (
              <div className="ml-12 flex items-center gap-2 text-sm text-ink/60">
                <span className="animate-pulse">●●●</span> Mentor is typing...
              </div>
            )}
            {error && <p className="ml-12 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <footer className="p-4">
          {allAnswered ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="w-full rounded-full bg-brand p-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Creating your summary..." : "Finish and see summary"}
            </button>
          ) : (
            <>
              <div className="flex items-end gap-2 rounded-3xl bg-cloud p-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  maxLength={2000}
                  rows={2}
                  placeholder="Type your answer... (Enter to send, Shift+Enter for a new line)"
                  className="max-h-40 flex-1 resize-none bg-transparent p-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!answer.trim() || loading}
                  aria-label="Send answer"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
                >
                  ➤
                </button>
              </div>
              <p className="mt-1 text-right text-xs text-ink/50">{answer.length}/2000</p>
            </>
          )}
        </footer>
      </div>
    </AppShell>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <InterviewContent />
    </Suspense>
  );
}
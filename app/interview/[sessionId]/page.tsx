"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import QuestionCard from "@/components/QuestionCard";
import FeedbackPanel from "@/components/FeedbackPanel";
import ProgressBar from "@/components/ProgressBar";

type Feedback = { score: number; strengths: string[]; improvements: string[] };
type Summary = { overallScore: number; summary: string; topImprovements: string[] };

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
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(6);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingNext, setPendingNext] = useState<{ question: string; difficulty: string } | null>(null);
  const [allAnswered, setAllAnswered] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
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
        setQuestion(s.currentQuestion);
        setDifficulty(s.currentDifficulty);
        if (s.status === "completed") {
          setSummary({
            overallScore: s.overallScore,
            summary: s.summary,
            topImprovements: s.topImprovements,
          });
        } else if (s.answeredCount >= s.totalQuestions) {
          setAllAnswered(true);
        }
      } catch (e: any) {
        setError(e.message);
      }
      setReady(true);
    });
    return () => unsub();
  }, [sessionId, router]);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const r = await api("/api/interview/answer", "POST", { sessionId, answer });
      setFeedback(r.feedback);
      setAnswered((n) => n + 1);
      if (r.done) setAllAnswered(true);
      else setPendingNext({ question: r.nextQuestion, difficulty: r.difficulty });
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleNext() {
    if (!pendingNext) return;
    setQuestion(pendingNext.question);
    setDifficulty(pendingNext.difficulty);
    setPendingNext(null);
    setFeedback(null);
    setAnswer("");
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
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Interview complete</h1>
        <p className="mt-4 text-3xl font-bold">{summary.overallScore}/10</p>
        <p className="mt-4">{summary.summary}</p>
        <h2 className="mt-6 font-semibold text-yellow-400">Top areas to improve</h2>
        <ul className="mt-1 list-disc pl-5">
          {summary.topImprovements.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        <div className="mt-8 flex gap-3">
          <Link href="/interview/new" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">
            New interview
          </Link>
          <Link href="/history" className="rounded border border-gray-600 px-4 py-2">
            History
          </Link>
        </div>
      </main>
    );
  }

  const number = feedback || allAnswered ? Math.min(answered, total) : answered + 1;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-bold">
        {role} · {level}
      </h1>
      <div className="mt-3">
        <ProgressBar current={answered} total={total} />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {question && !(allAnswered && !feedback) && (
        <div className="mt-6">
          <QuestionCard question={question} difficulty={difficulty} number={number} total={total} />
        </div>
      )}

      {/* Answer box */}
      {!feedback && !allAnswered && (
        <div className="mt-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={2000}
            rows={7}
            placeholder="Type your answer here..."
            className="w-full rounded border border-gray-600 bg-white p-3 text-black"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{answer.length}/2000</p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="mt-2 w-full rounded bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Analyzing your answer..." : "Submit answer"}
          </button>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="mt-4">
          <FeedbackPanel {...feedback} />
        </div>
      )}

      {feedback && !allAnswered && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-4 w-full rounded bg-blue-600 p-3 font-semibold text-white"
        >
          Next question
        </button>
      )}

      {allAnswered && (
        <button
          type="button"
          onClick={handleFinish}
          disabled={loading}
          className="mt-4 w-full rounded bg-green-600 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating your summary..." : "Finish and see summary"}
        </button>
      )}
      
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <InterviewContent />
    </Suspense>
  );
}
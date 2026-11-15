"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppShell from "@/components/AppShell";

type Item = {
  id: string;
  role: string;
  level: string;
  status: string;
  answeredCount: number;
  totalQuestions: number;
  overallScore: number | null;
  startedAt: number;
};

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/interview/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load history");
        setItems(data.sessions);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end justify-between gap-4">
            <h1 className="display text-5xl sm:text-6xl">
              Your
              <br />
              interviews
            </h1>
            <Link
              href="/interview/new"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              New interview
            </Link>
          </div>

          {loading && <p className="mt-6">Loading...</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="mt-6 text-ink/60">No interviews yet. Start your first one!</p>
          )}

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/interview/${s.id}`}
                  className="block rounded-3xl bg-white p-3 transition hover:shadow-md"
                >
                  <div className="px-3 pb-2 pt-2">
                    <p className="text-lg">{s.role}</p>
                    <p className="text-xs text-ink/60">
                      {s.level} · {s.startedAt ? new Date(s.startedAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                  {s.status === "completed" ? (
                    <div className="flex items-center justify-between rounded-2xl bg-brand px-4 py-3 text-white">
                      <span className="text-sm">Overall score</span>
                      <span className="text-2xl font-light">{s.overallScore}/10</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl bg-cloud px-4 py-3">
                      <span className="text-sm">In progress</span>
                      <span className="text-sm text-ink/60">
                        {s.answeredCount}/{s.totalQuestions}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
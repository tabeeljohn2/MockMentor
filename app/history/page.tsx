"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your interviews</h1>
        <Link href="/interview/new" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">
          New interview
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {!error && items.length === 0 && (
        <p className="mt-6 text-gray-400">No interviews yet. Start your first one!</p>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((s) => (
          <li key={s.id}>
            <Link
              href={`/interview/${s.id}`}
              className="flex items-center justify-between rounded border border-gray-700 p-4 hover:border-blue-500"
            >
              <div>
                <p className="font-semibold">
                  {s.role} · {s.level}
                </p>
                <p className="text-sm text-gray-400">
                  {s.startedAt ? new Date(s.startedAt).toLocaleString() : ""}
                </p>
              </div>
              <div className="text-right">
                {s.status === "completed" ? (
                  <p className="text-lg font-bold">{s.overallScore}/10</p>
                ) : (
                  <p className="text-sm text-yellow-400">
                    In progress ({s.answeredCount}/{s.totalQuestions})
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppShell from "@/components/AppShell";

const ROLES = [
  { name: "Frontend Developer", hint: "UI, React, CSS, accessibility", tile: "bg-butter" },
  { name: "Backend Developer", hint: "APIs, databases, servers", tile: "bg-ice" },
  { name: "Data Analyst", hint: "SQL, statistics, dashboards", tile: "bg-peach" },
  { name: "Product Manager", hint: "Roadmaps, metrics, users", tile: "bg-cloud" },
];
const LEVELS = ["Junior", "Mid", "Senior"];

export default function NewInterviewPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setChecking(false);
    });
    return () => unsub();
  }, [router]);

  async function handleStart() {
    setError("");
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/interview/${data.sessionId}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        {checking ? (
          <p className="p-6">Loading...</p>
        ) : (
          <div className="mx-auto max-w-3xl">
            <h1 className="display text-5xl sm:text-6xl">
              New
              <br />
              interview
            </h1>
            <p className="mt-3 text-sm text-ink/70">Choose your target role and level.</p>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-ink/50">Role</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setRole(r.name)}
                  className={`rounded-3xl p-5 text-left transition ${r.tile} ${
                    role === r.name ? "ring-2 ring-brand" : "ring-0 hover:brightness-95"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg">{r.name}</p>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        role === r.name ? "bg-brand text-white" : "bg-white/70"
                      }`}
                    >
                      {role === r.name ? "✓" : ""}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink/60">{r.hint}</p>
                </button>
              ))}
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-ink/50">Level</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`rounded-full px-6 py-3 text-sm font-medium transition ${
                    level === l ? "bg-ink text-white" : "bg-white hover:bg-white/70"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={handleStart}
              disabled={!role || !level || loading}
              className="mt-8 w-full rounded-full bg-brand p-4 text-sm font-semibold text-white disabled:opacity-40 sm:w-auto sm:px-12"
            >
              {loading ? "Starting..." : "Start interview"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
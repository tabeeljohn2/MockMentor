"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Product Manager",
];
const LEVELS = ["Junior", "Mid", "Senior"];

export default function NewInterviewPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if not signed in
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
    // TODO (Step 5): call POST /api/interview/start with { role, level },
    // then router.push(`/interview/${sessionId}`)
    console.log("Starting interview:", { role, level });
    setLoading(false);
  }

  if (checking) return <p className="p-6">Loading...</p>;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">New interview</h1>
      <p className="mt-1 text-gray-400">Choose your target role and level.</p>

      <h2 className="mt-6 font-semibold">Role</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded border px-3 py-2 ${
              role === r ? "border-blue-500 bg-blue-600 text-white" : "border-gray-600"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <h2 className="mt-6 font-semibold">Level</h2>
      <div className="mt-2 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={`rounded border px-3 py-2 ${
              level === l ? "border-blue-500 bg-blue-600 text-white" : "border-gray-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={!role || !level || loading}
        className="mt-8 w-full rounded bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Starting..." : "Start interview"}
      </button>
    </main>
  );
}
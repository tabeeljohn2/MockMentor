"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/interview/new");
    }  catch (err: any) {
  console.error(err);
  setError(err?.code ?? "Unknown error");
} finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">MockMentor</h1>
      <h2 className="mt-2 text-gray-400">
  {isSignUp ? "Create your account" : "Log in to practice"}
</h2>

<form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="rounded border border-gray-600 bg-white p-2 text-black"
  />
  <input
    type="password"
    placeholder="Password (min 6 characters)"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={6}
    className="rounded border border-gray-600 bg-white p-2 text-black"
  />

  {error && <p className="text-sm text-red-400">{error}</p>}

  <button
    type="submit"
    disabled={loading}
    className="rounded bg-blue-600 p-2 font-semibold text-white disabled:opacity-50"
  >
    {loading ? "Please wait..." : isSignUp ? "Sign up" : "Log in"}
  </button>
</form>

<button
  type="button"
  onClick={() => setIsSignUp(!isSignUp)}
  className="mt-4 text-sm text-blue-400 underline"
>
  {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
</button>
    </main>
  );
}
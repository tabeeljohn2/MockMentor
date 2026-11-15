"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Logo from "@/components/Logo";

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
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "That email already has an account. Try logging in instead.",
        "auth/invalid-credential": "Wrong email or password.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setError(messages[err?.code] ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="flex flex-1 flex-col justify-between bg-brand p-8 text-white md:p-12">
        <Logo tone="light" size="lg" />
        <h1 className="display my-10 text-5xl sm:text-6xl">
          Practice
          <br />
          interviews
          <br />
          that matter
        </h1>
        <p className="max-w-sm text-sm text-white/80">
          Answer adaptive questions and get instant, specific feedback from your AI mentor.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-page p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8">
          <h2 className="display text-3xl">{isSignUp ? "Create account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm text-ink/60">
            {isSignUp ? "Start practicing in a minute." : "Log in to keep practicing."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-2xl bg-cloud p-4 text-sm outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-2xl bg-cloud p-4 text-sm outline-none focus:ring-2 focus:ring-brand"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink p-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignUp ? "Sign up" : "Log in"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 text-sm underline decoration-brand decoration-2 underline-offset-4"
          >
            {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
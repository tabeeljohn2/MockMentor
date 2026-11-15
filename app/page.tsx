import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-dvh bg-page">
      <header className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5">
        <nav className="flex gap-4 text-xs sm:gap-6 sm:text-sm">
          <Link href="/interview/new">Practice</Link>
          <Link href="/history">History</Link>
        </nav>
        <Logo hideTextOnMobile />
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 pb-10 md:grid-cols-2">
        {/* Left: headline + sample chat */}
        <section className="flex flex-col">
          <h1 className="display mt-4 text-6xl sm:text-7xl md:text-8xl">
            Mock
            <br />
            Mentor
          </h1>
          <p className="mt-3 text-sm text-ink/70">Frontend / Backend / Data / Product</p>

          <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white/60 p-5">
            <div className="flex items-end gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">M</div>
              <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-peach px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/60">Question 1 / 6 · EASY</p>
                <p className="mt-1 text-sm">What is the difference between let, const, and var?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-3xl rounded-br-md bg-ice px-4 py-3 text-sm">
                var is function-scoped; let and const are block-scoped.
              </div>
            </div>
            <div className="ml-11 flex items-center justify-between rounded-2xl bg-brand px-4 py-3 text-white">
              <span className="text-sm">Score</span>
              <span className="text-2xl font-light">8/10</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/login" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              Get started
            </Link>
            <Link href="/login" className="rounded-full border border-ink/30 px-6 py-3 text-sm font-medium hover:bg-white">
              Log in
            </Link>
          </div>
        </section>

        {/* Right: bento cards */}
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white p-5">
              <p className="text-xs text-ink/60">Questions</p>
              <p className="mt-3 text-3xl font-light">6 per interview</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-xs text-ink/60">Feedback</p>
              <p className="mt-3 text-3xl font-light">After every answer</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-cloud p-4">
                <p className="text-xs text-ink/60">Roles</p>
                <p className="mt-1 text-sm">4 career tracks</p>
              </div>
              <div className="rounded-2xl bg-brand p-4 text-white">
                <p className="text-xs text-white/80">Adaptive difficulty</p>
                <p className="mt-1 text-sm">Easy → Medium → Hard</p>
              </div>
              <div className="rounded-2xl bg-cloud p-4">
                <p className="text-xs text-ink/60">Levels</p>
                <p className="mt-1 text-sm">Junior / Mid / Senior</p>
              </div>
              <div className="rounded-2xl bg-cloud p-4">
                <p className="text-xs text-ink/60">Scoring</p>
                <p className="mt-1 text-sm">0-10 with tips</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-cloud p-4">
                <p className="text-xs text-ink/60">Powered by</p>
                <p className="mt-1 text-sm">Next.js · Firebase · Gemini AI</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl bg-butter p-4 text-sm">Smart questions</div>
            <div className="rounded-3xl bg-ice p-4 text-sm">Instant feedback</div>
            <div className="rounded-3xl bg-peach p-4 text-sm">Track progress</div>
          </div>
        </section>
      </main>
    </div>
  );
}
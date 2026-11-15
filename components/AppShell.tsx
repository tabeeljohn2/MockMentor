"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/interview/new", label: "New interview" },
  { href: "/history", label: "History" },
];

export default function AppShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <div className="flex h-dvh flex-col bg-page">
      <header className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-4">
        <nav className="flex gap-4 text-xs sm:gap-6 sm:text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                pathname === n.href
                  ? "font-semibold underline decoration-brand decoration-2 underline-offset-8"
                  : "text-ink/70 hover:text-ink"
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link href="/">
          <Logo hideTextOnMobile />
        </Link>

        <div className="flex justify-end">
          <button
            onClick={logout}
            className="rounded-full border border-ink/20 px-4 py-2 text-xs font-medium hover:bg-white sm:text-sm"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-5 px-5 pb-5">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
        {right && <aside className="hidden w-80 shrink-0 overflow-y-auto lg:block">{right}</aside>}
      </div>
    </div>
  );
}
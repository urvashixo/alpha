"use client";

import { FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadSettings } from "./lib/settings-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isAuthed = document.cookie.includes("alpha-auth=1");
    if (isAuthed) {
      const settings = loadSettings();
      router.replace(settings.preferences.defaultLandingPage);
    }
  }, [router]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.cookie = "alpha-auth=1; Path=/; SameSite=Lax";
    const settings = loadSettings();
    router.push(settings.preferences.defaultLandingPage);
  }

  return (
    <main className="dashboard-grid flex min-h-screen items-center justify-center p-4">
      <section className="glass w-full max-w-md rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Alpha Admin Login</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Sign in to access your dashboard.</p>

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Email</span>
            <input
              type="text"
              placeholder="Enter any email"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Password</span>
            <input
              type="password"
              placeholder="Enter any password"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
            />
          </label>
          <button className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}

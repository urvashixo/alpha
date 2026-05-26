"use client";

import { useState } from "react";
import AdminSidebar from "../components/admin-sidebar";
import { loadSettings, saveSettings } from "../lib/settings-storage";
import { AppSettings, UserRole } from "../types/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  function update<K extends keyof AppSettings["profile"]>(key: K, value: AppSettings["profile"][K]) {
    const next = {
      ...settings,
      profile: {
        ...settings.profile,
        [key]: value,
      },
    };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath="/settings" />
        <main className="space-y-4">
          <header className="glass rounded-2xl p-4">
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <p className="text-sm text-[var(--muted)]">Manage your profile details.</p>
          </header>

          <section className="glass rounded-2xl p-4">
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <img
                  src={settings.profile.photoUrl}
                  alt={settings.profile.fullName}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
                <p className="mt-3 text-center text-lg font-semibold">{settings.profile.fullName}</p>
                <p className="text-center text-xs text-[var(--muted)]">{settings.profile.role}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Profile photo URL</span>
                  <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" value={settings.profile.photoUrl} onChange={(event) => update("photoUrl", event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Full name</span>
                  <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" value={settings.profile.fullName} onChange={(event) => update("fullName", event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Email</span>
                  <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" value={settings.profile.email} onChange={(event) => update("email", event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Role</span>
                  <select className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" value={settings.profile.role} onChange={(event) => update("role", event.target.value as UserRole)}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

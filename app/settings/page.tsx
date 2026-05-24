"use client";

import { useState } from "react";
import AdminSidebar from "../components/admin-sidebar";
import { loadSettings, saveSettings } from "../lib/settings-storage";
import { AppSettings, LandingPage, SortPreference, UserRole } from "../types/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  function persist(next: AppSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function updateProfileField<K extends keyof AppSettings["profile"]>(key: K, value: AppSettings["profile"][K]) {
    persist({
      ...settings,
      profile: {
        ...settings.profile,
        [key]: value,
      },
    });
  }

  function updatePreferenceField<K extends keyof AppSettings["preferences"]>(
    key: K,
    value: AppSettings["preferences"][K],
  ) {
    persist({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  }

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath="/settings" />

        <main className="space-y-4">
          <header className="glass rounded-2xl p-4">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <p className="text-sm text-[var(--muted)]">Profile and dashboard defaults.</p>
          </header>

          <section className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold">Profile Settings</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <img
                  src={settings.profile.photoUrl}
                  alt={settings.profile.fullName}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
                <p className="mt-3 text-center font-semibold">{settings.profile.fullName}</p>
                <p className="text-center text-xs text-[var(--muted)]">{settings.profile.role}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Profile photo URL</span>
                  <input
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                    value={settings.profile.photoUrl}
                    onChange={(event) => updateProfileField("photoUrl", event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Full name</span>
                  <input
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                    value={settings.profile.fullName}
                    onChange={(event) => updateProfileField("fullName", event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Email</span>
                  <input
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                    value={settings.profile.email}
                    onChange={(event) => updateProfileField("email", event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Role</span>
                  <select
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                    value={settings.profile.role}
                    onChange={(event) => updateProfileField("role", event.target.value as UserRole)}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
                    Edit profile
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold">Dashboard Preferences</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-[var(--muted)]">Default landing page</span>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  value={settings.preferences.defaultLandingPage}
                  onChange={(event) =>
                    updatePreferenceField("defaultLandingPage", event.target.value as LandingPage)
                  }
                >
                  <option value="/overview">Overview</option>
                  <option value="/products">Products</option>
                  <option value="/analytics">Analytics</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-[var(--muted)]">Rows per page</span>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  value={settings.preferences.rowsPerPage}
                  onChange={(event) =>
                    updatePreferenceField("rowsPerPage", Number(event.target.value) as 10 | 25 | 50)
                  }
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-[var(--muted)]">Default sorting</span>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  value={settings.preferences.defaultSorting}
                  onChange={(event) =>
                    updatePreferenceField("defaultSorting", event.target.value as SortPreference)
                  }
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
              </label>

              <label className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                <span>Sidebar collapsed by default</span>
                <input
                  type="checkbox"
                  checked={settings.preferences.sidebarCollapsed}
                  onChange={(event) => updatePreferenceField("sidebarCollapsed", event.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </label>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

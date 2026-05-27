"use client";

import { useRouter } from "next/navigation";
import { loadSettings, saveSettings } from "../lib/settings-storage";

type TopNavbarProps = {
  title: string;
  description?: string;
};

export default function TopNavbar({ title, description }: TopNavbarProps) {
  const router = useRouter();
  const settings = loadSettings();
  const role = typeof document !== "undefined" && document.cookie.includes("alpha-role=admin") ? "admin" : "user";

  function switchRole(newRole: "admin" | "user") {
    document.cookie = `alpha-role=${newRole}; Path=/; SameSite=Lax`;
    const current = loadSettings();
    current.profile.role = newRole === "admin" ? "Admin" : "User";
    saveSettings(current);
    router.refresh();
  }

  return (
    <header className="glass rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={role}
            onChange={(event) => switchRole(event.target.value as "admin" | "user")}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
            <img
              src={settings.profile.photoUrl}
              alt={settings.profile.fullName}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="hidden text-xs font-medium sm:inline">{settings.profile.fullName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

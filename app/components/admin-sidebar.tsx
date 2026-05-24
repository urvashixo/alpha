"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadSettings } from "../lib/settings-storage";

type AdminSidebarProps = {
  currentPath: string;
};

const NAV_ITEMS = [
  { label: "Overview", href: "/overview" },
  { label: "Products", href: "/products" },
  { label: "Analytics", href: "/analytics" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const router = useRouter();
  const settings = loadSettings();
  const profile = settings.profile;
  const collapsed = settings.preferences.sidebarCollapsed;

  function handleLogout() {
    document.cookie = "alpha-auth=; Max-Age=0; Path=/; SameSite=Lax";
    router.push("/");
  }

  return (
    <aside className={`rounded-2xl border border-[#1f1f1f] bg-[#121212] p-4 text-[#efe9da] shadow-2xl lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] ${collapsed ? "lg:w-[88px]" : ""}`}>
      <div className="mb-8 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-[#f1b8df]" />
        <div className={collapsed ? "hidden" : "block"}>
          <p className="text-sm text-[#b4ad9c]">Project</p>
          <h1 className="text-lg font-semibold">Alpha Console</h1>
        </div>
      </div>
      <nav className="space-y-2 text-sm">
        {NAV_ITEMS.map((item) => {
          const active = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 transition ${
                active
                  ? "bg-[#2a2a2a] font-medium text-white"
                  : "text-[#bdb6a7] hover:bg-[#1e1e1e]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </Link>
          );
        })}
      </nav>
      <section className="mt-8 rounded-xl border border-[#313131] bg-[#1a1a1a] p-3">
        <p className="text-xs text-[#b4ad9c]">User profile</p>
        <div className="mt-2 flex items-center gap-2">
          <img src={profile.photoUrl} alt={profile.fullName} className="h-8 w-8 rounded-full object-cover" />
          <div className={collapsed ? "hidden" : "block"}>
            <p className="font-semibold">{profile.fullName}</p>
            <p className="font-mono text-xs text-[#b4ad9c]">{profile.email}</p>
          </div>
        </div>
      </section>
      <button
        onClick={handleLogout}
        className="mt-3 w-full rounded-lg border border-[#3d3d3d] bg-[#0f0f0f] px-3 py-2 text-sm text-[#efe9da]"
      >
        {collapsed ? "Out" : "Logout"}
      </button>
      {!collapsed && (
        <Link href="/settings" className="mt-2 block text-center text-xs text-[#b4ad9c] hover:underline">
          Edit profile
        </Link>
      )}
    </aside>
  );
}

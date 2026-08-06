"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", icon: "◆" },
  { href: "/dashboard/portfolio", label: "Portfolio Content", icon: "✎" },
  { href: "/dashboard/deadlines", label: "Deadlines", icon: "⏰" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "🗓" },
  { href: "/dashboard/activity", label: "Activity", icon: "📈" },
  { href: "/dashboard/jobs", label: "Job Matcher", icon: "🎯" },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: "✦" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((l) => {
        const active = l.href === "/dashboard" ? pathname === l.href : pathname?.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-accent/15 text-foreground font-medium"
                : "text-muted hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

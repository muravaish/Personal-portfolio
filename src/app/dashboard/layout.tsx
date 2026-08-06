import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ReminderBanner } from "@/components/dashboard/ReminderBanner";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="dashboard-scope min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            <span className="gradient-text">portfolio</span>.dev
          </Link>
          <span className="text-xs text-muted">Command Center — all data stays in your browser</span>
        </div>
      </header>

      <ReminderBanner />

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="lg:w-56 lg:shrink-0">
          <DashboardNav />
        </aside>
        <main className="min-w-0 flex-1 pb-24">{children}</main>
      </div>
    </div>
  );
}

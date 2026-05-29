"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const nav = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/dashboard/upload", label: "Upload PDF" },
  { href: "/admin/dashboard/editions", label: "Editions" },
  { href: "/admin/dashboard/homepage", label: "Homepage" },
] as const;

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-red-100/60 via-transparent to-blue-100/50 dark:from-red-950/80 dark:via-zinc-950 dark:to-blue-950/80" />

      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Street Voice
            </Link>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-card-muted sm:inline-flex"
            >
              View site
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-48 lg:flex-col lg:gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                    : "text-muted hover:bg-card-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

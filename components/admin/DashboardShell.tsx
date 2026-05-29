"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ToastProvider } from "@/components/admin/ToastProvider";

const nav = [
  { href: "/admin/dashboard", label: "Overview", icon: "◉" },
  { href: "/admin/dashboard/upload", label: "Upload", icon: "↑" },
  { href: "/admin/dashboard/editions", label: "Editions", icon: "▤" },
  { href: "/admin/dashboard/homepage", label: "Homepage", icon: "⌂" },
] as const;

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background pb-20 text-foreground lg:pb-8">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-red-100/60 via-transparent to-blue-100/50 dark:from-red-950/80 dark:via-zinc-950 dark:to-blue-950/80" />

        <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <div>
              <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Street Voice
              </Link>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
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

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 lg:flex-row lg:gap-8 lg:py-8">
          <nav className="hidden shrink-0 gap-1 lg:flex lg:w-48 lg:flex-col">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
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

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                      : "text-muted"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </ToastProvider>
  );
}

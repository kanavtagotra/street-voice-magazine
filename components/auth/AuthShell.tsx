import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/80 via-zinc-50 to-blue-100/80 dark:from-red-950 dark:via-zinc-950 dark:to-blue-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(248,113,113,0.25),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_30%_0%,rgba(220,38,38,0.2),transparent_50%)]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex max-w-md flex-col px-5 pb-16 pt-6 sm:px-8">
        <div className="animate-fade-up mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>

        <div className="animate-fade-up rounded-3xl border border-border bg-card/90 p-6 shadow-xl shadow-zinc-300/30 backdrop-blur-xl transition-colors duration-300 dark:shadow-black/40 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

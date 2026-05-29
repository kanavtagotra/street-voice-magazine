"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { navLinks } from "@/lib/data";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <Container className="flex items-center justify-between gap-3 py-4 sm:py-5">
        <Logo onHero={!scrolled} />

        <div className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <UserMenu />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <UserMenu />
          <ThemeToggle />
          <button
            type="button"
            className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-border bg-card backdrop-blur-md transition hover:bg-card-muted"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span
              className={`h-0.5 w-5 rounded-full bg-foreground transition duration-300 ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-foreground transition duration-300 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-foreground transition duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </Container>

      <div
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl transition duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex h-full flex-col items-center justify-center gap-8">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <a
                href={link.href}
                className="text-2xl font-medium text-foreground transition hover:text-red-600 dark:hover:text-red-300"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

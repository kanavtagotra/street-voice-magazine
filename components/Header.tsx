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
  const onHero = !scrolled;

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

  const navLinkClass = onHero
    ? "text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white"
    : "text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <Container className="flex items-center justify-between gap-3 py-4 sm:py-5">
        <Logo onHero={onHero} />

        <div className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={navLinkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <UserMenu onHero={onHero} />
          <ThemeToggle onHero={onHero} />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <UserMenu onHero={onHero} />
          <ThemeToggle onHero={onHero} />
          <button
            type="button"
            className={`relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border backdrop-blur-md transition ${
              onHero
                ? "border-white/20 bg-white/10 hover:bg-white/15"
                : "border-border bg-card hover:bg-card-muted"
            }`}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span
              className={`h-0.5 w-5 rounded-full transition duration-300 ${onHero ? "bg-white" : "bg-foreground"} ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-5 rounded-full transition duration-300 ${onHero ? "bg-white" : "bg-foreground"} ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-5 rounded-full transition duration-300 ${onHero ? "bg-white" : "bg-foreground"} ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </Container>

      <div
        className={`fixed inset-0 z-40 backdrop-blur-2xl transition duration-300 lg:hidden ${
          onHero ? "bg-zinc-950/95" : "bg-background/95"
        } ${open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
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
                className={`text-2xl font-medium transition ${
                  onHero
                    ? "text-white hover:text-red-200"
                    : "text-foreground hover:text-red-600 dark:hover:text-red-300"
                }`}
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

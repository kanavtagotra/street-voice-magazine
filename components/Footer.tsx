import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { navLinks, siteConfig, socialLinks } from "@/lib/data";

export function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-28 border-t border-border bg-zinc-100 transition-colors duration-300 dark:bg-zinc-950"
    >
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Premium editorial magazine platform for India&apos;s most relevant
              stories — from the streets to the national conversation.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
              Navigate
            </p>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
              Contact
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="block text-sm text-muted transition hover:text-foreground"
            >
              {siteConfig.email}
            </a>
            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className="block text-sm text-muted transition hover:text-foreground"
            >
              {siteConfig.phone}
            </a>
            <p className="text-sm text-muted">{siteConfig.location}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition duration-200 hover:border-zinc-400 hover:bg-zinc-50 dark:bg-transparent dark:text-zinc-300 dark:hover:border-white/25 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-border pt-8 text-center text-xs text-muted sm:text-left">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

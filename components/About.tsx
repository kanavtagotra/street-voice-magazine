import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/lib/data";

const highlights = [
  "31 years of trusted publication",
  "Monthly digital editions",
  "Deep focus on Jammu & Kashmir",
  "National stories with local insight",
];

export function About() {
  return (
    <section id="about" className="scroll-mt-28 py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 rounded-3xl border border-border bg-gradient-to-br from-white via-zinc-50/80 to-blue-50/40 p-8 shadow-lg shadow-zinc-300/25 transition-colors duration-300 dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent dark:shadow-xl dark:shadow-black/30 sm:p-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeader
            eyebrow="About"
            title={`About ${siteConfig.name}`}
            description={siteConfig.description}
          />

          <ul className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-border bg-white/80 px-5 py-4 text-sm font-medium text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-zinc-900/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

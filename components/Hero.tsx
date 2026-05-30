import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/lib/data";
import { getActivePdfEdition } from "@/lib/server/pdf-magazine-store";

export async function Hero() {
  const active = await getActivePdfEdition();

  return (
    <section id="home" className="scroll-mt-24 pb-16 pt-6 sm:pb-24 sm:pt-10">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-up space-y-8">
            {active ? (
              <p className="inline-flex rounded-full border border-red-300/60 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-red-800 backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:text-red-200">
                {active.title}
              </p>
            ) : null}

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl lg:leading-[1.02] dark:text-white">
                {siteConfig.heroHeadline}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-zinc-700 sm:text-lg dark:text-white/75">
                {siteConfig.tagline}
              </p>
            </div>

            {active ? (
              <div className="flex flex-wrap gap-3">
                <a
                  href="#latest"
                  className="inline-flex rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
                >
                  Read latest issue
                </a>
                <Link
                  href="/archive"
                  className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-card-muted"
                >
                  Archive
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">
                The latest edition will appear here after publication.
              </p>
            )}
          </div>

          <div className="animate-fade-up mx-auto w-full max-w-sm [animation-delay:120ms] sm:max-w-md lg:mx-0 lg:ml-auto lg:max-w-lg">
            {active ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                <iframe
                  src={active.pdfUrl}
                  title={active.title}
                  className="aspect-[3/4] w-full min-h-[420px]"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-zinc-400/50 bg-white/50 text-sm text-muted backdrop-blur-sm dark:border-white/20 dark:bg-white/5">
                Magazine preview
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

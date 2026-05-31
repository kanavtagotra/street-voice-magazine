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
              <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-red-200 backdrop-blur-md">
                {active.title}
              </p>
            ) : null}

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                {siteConfig.heroHeadline}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                {siteConfig.tagline}
              </p>
            </div>

            {active ? (
              <div className="flex flex-wrap gap-3">
                <a
                  href="#latest"
                  className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition hover:bg-zinc-100"
                >
                  Read latest issue
                </a>
                <Link
                  href="/archive"
                  className="inline-flex rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
                >
                  Archive
                </Link>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                The latest edition will appear here after publication.
              </p>
            )}
          </div>

          <div className="animate-fade-up mx-auto w-full max-w-sm [animation-delay:120ms] sm:max-w-md lg:mx-0 lg:ml-auto lg:max-w-lg">
            {active ? (
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/40 shadow-2xl shadow-black/40">
                <iframe
                  src={active.pdfUrl}
                  title={active.title}
                  className="aspect-[3/4] w-full min-h-[420px]"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm text-zinc-400 backdrop-blur-sm">
                Magazine preview
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

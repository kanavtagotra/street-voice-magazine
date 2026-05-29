import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LatestEdition } from "@/components/LatestEdition";
import { ArchiveSection } from "@/components/PreviousEditions";
import { GradientHero } from "@/components/layout/GradientHero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <GradientHero>
        <Header />
        <Hero />
      </GradientHero>

      <main className="relative">
        <LatestEdition />
        <ArchiveSection />
        <About />
      </main>

      <Footer />
    </div>
  );
}

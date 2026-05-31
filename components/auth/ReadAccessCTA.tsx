"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { readRoute } from "@/lib/data";

type ReadAccessCTAProps = {
  onHero?: boolean;
  label?: string;
};

export function ReadAccessCTA({
  onHero = false,
  label = "Read Latest Edition",
}: ReadAccessCTAProps) {
  const { data: session, status } = useSession();
  const loginHref = `/login?callbackUrl=${encodeURIComponent(readRoute)}`;

  if (status === "loading") {
    return (
      <div
        className={`inline-flex h-12 w-44 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10 ${onHero ? "" : ""}`}
      />
    );
  }

  if (session?.user) {
    return (
      <Button href={readRoute} variant="primary" onHero={onHero}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button href={loginHref} variant="primary" onHero={onHero}>
        Sign in to read
      </Button>
      <Link
        href="/signup"
        className={`text-sm font-medium transition ${
          onHero
            ? "text-white/70 hover:text-white"
            : "text-muted hover:text-foreground"
        }`}
      >
        Create free account
      </Link>
    </div>
  );
}

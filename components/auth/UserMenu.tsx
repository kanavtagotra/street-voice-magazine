"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { readRoute } from "@/lib/data";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "U";
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-card-muted"
      >
        Login
      </Link>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-gradient-to-br from-red-500/20 to-blue-500/20 text-xs font-bold text-foreground ring-2 ring-transparent transition hover:ring-red-500/30"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials(session.user.name, session.user.email)
        )}
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-2 min-w-[220px] origin-top-right rounded-2xl border border-border bg-card p-2 shadow-xl shadow-zinc-400/20 transition duration-200 dark:shadow-black/40 ${
          open
            ? "visible scale-100 opacity-100"
            : "invisible pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {session.user.name}
          </p>
          <p className="truncate text-xs text-muted">{session.user.email}</p>
        </div>

        <ul className="py-1">
          <li>
            <Link
              href={readRoute}
              className="block rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-card-muted"
              onClick={() => setOpen(false)}
            >
              Read current edition
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="block rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-card-muted"
              onClick={() => setOpen(false)}
            >
              Profile & preferences
            </Link>
          </li>
          {isAdmin ? (
            <li>
              <Link
                href="/admin/dashboard"
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-muted transition hover:bg-card-muted hover:text-foreground"
              onClick={() => {
                setOpen(false);
                void signOut({ callbackUrl: "/" });
              }}
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

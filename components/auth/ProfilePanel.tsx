"use client";

import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import {
  loadReadingPreferences,
  saveReadingPreferences,
} from "@/lib/auth/reading-preferences";
import type { ReadingPreferences } from "@/lib/types/user";

type ProfilePanelProps = {
  user: Session["user"];
};

export function ProfilePanel({ user }: ProfilePanelProps) {
  const [name, setName] = useState(user.name ?? "");
  const [prefs, setPrefs] = useState<ReadingPreferences>({});
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(loadReadingPreferences());
  }, []);

  async function saveProfile() {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setStatus(res.ok ? "Display name updated for this session." : "Could not save profile.");
  }

  function savePreferences() {
    setSaving(true);
    setStatus(null);
    saveReadingPreferences(prefs);
    setSaving(false);
    setStatus("Reading preferences saved on this device.");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-2 text-sm text-muted">{user.email}</p>
        {user.role === "admin" ? (
          <span className="mt-3 inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Administrator
          </span>
        ) : null}
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-zinc-300/20 dark:shadow-black/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Display name</h2>
        <p className="mt-1 text-xs text-muted">
          Managed by Google sign-in; local edits apply to this session only.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={() => void saveProfile()}
          disabled={saving}
          className="mt-4 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Save profile
        </button>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-zinc-300/20 dark:shadow-black/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Reading preferences
        </h2>
        <p className="mt-1 text-xs text-muted">Saved locally on this device.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Default page quality</label>
            <select
              value={prefs.readerVariant ?? "mobile"}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  readerVariant: e.target.value as ReadingPreferences["readerVariant"],
                }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="thumb">Data saver</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop HD</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.autoFullscreen ?? false}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, autoFullscreen: e.target.checked }))
              }
              className="rounded"
            />
            Prefer fullscreen when opening reader
          </label>
        </div>
        <button
          type="button"
          onClick={savePreferences}
          disabled={saving}
          className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-card-muted"
        >
          Save preferences
        </button>
      </section>

      {status ? (
        <p className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm">{status}</p>
      ) : null}
    </div>
  );
}

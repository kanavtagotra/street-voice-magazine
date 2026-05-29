"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/server/site-settings";

type SiteSettingsFormProps = {
  initial: SiteSettings;
  editions: { id: string; title: string; isCurrent: boolean }[];
};

export function SiteSettingsForm({ initial, editions }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setStatus(res.ok ? "Homepage settings saved." : "Could not save settings.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-zinc-300/15 dark:shadow-black/25"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Hero headline override
        </label>
        <input
          value={settings.heroHeadline ?? ""}
          onChange={(e) =>
            setSettings((s) => ({ ...s, heroHeadline: e.target.value || undefined }))
          }
          placeholder="Leave empty for site default"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Hero tagline override
        </label>
        <input
          value={settings.heroTagline ?? ""}
          onChange={(e) =>
            setSettings((s) => ({ ...s, heroTagline: e.target.value || undefined }))
          }
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Featured edition
        </label>
        <select
          value={settings.featuredEditionId ?? ""}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              featuredEditionId: e.target.value || null,
            }))
          }
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">Current edition (default)</option>
          {editions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
              {e.isCurrent ? " (current)" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
      >
        {saving ? "Saving…" : "Save homepage settings"}
      </button>

      {status ? (
        <p className="text-sm text-muted">{status}</p>
      ) : null}
    </form>
  );
}

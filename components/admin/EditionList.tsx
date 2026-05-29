"use client";

import { useEffect, useState } from "react";

type EditionRow = {
  id: string;
  title: string;
  headline: string;
  pageCount: number;
  isCurrent: boolean;
  storageMb: number;
  processedAt?: string;
};

type StatusPayload = {
  currentEditionId: string | null;
  editions: EditionRow[];
  accessRules: Record<string, string>;
};

type EditionListProps = {
  adminSecret: string;
};

export function EditionList({ adminSecret }: EditionListProps) {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminSecret) return;

    fetch("/api/admin/status", {
      headers: { "x-admin-secret": adminSecret },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load editions");
        return res.json() as Promise<StatusPayload>;
      })
      .then(setData)
      .catch(() => setError("Could not load edition status."));
  }, [adminSecret]);

  if (!adminSecret) {
    return (
      <p className="text-sm text-zinc-500">
        Enter admin secret above to view processed editions.
      </p>
    );
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!data) return <p className="text-sm text-zinc-500">Loading editions…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 text-xs text-zinc-400">
        <p className="font-semibold text-zinc-300">Magazine rules</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {Object.entries(data.accessRules).map(([key, value]) => (
            <li key={key}>
              <span className="text-zinc-500">{key}:</span> {value}
            </li>
          ))}
        </ul>
      </div>

      {data.editions.length === 0 ? (
        <p className="text-sm text-zinc-500">No editions processed yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.editions.map((edition) => (
            <li
              key={edition.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{edition.title}</p>
                  <p className="text-sm text-zinc-400">{edition.headline}</p>
                </div>
                {edition.isCurrent ? (
                  <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                    Current
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Archive
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {edition.pageCount} pages · {edition.storageMb} MB stored · ID:{" "}
                {edition.id}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

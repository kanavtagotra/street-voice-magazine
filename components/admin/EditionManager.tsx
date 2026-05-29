"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type EditionRow = {
  id: string;
  title: string;
  headline: string;
  summary: string;
  pageCount: number;
  isCurrent: boolean;
  storageMb: number;
};

export function EditionManager() {
  const [editions, setEditions] = useState<EditionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditionRow | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/status", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { editions: EditionRow[] }) => {
        setEditions(data.editions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveEdition() {
    if (!editing) return;
    const res = await fetch(`/api/admin/editions/${editing.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editing.title,
        headline: editing.headline,
        summary: editing.summary,
      }),
    });
    if (res.ok) {
      setMessage("Edition updated.");
      setEditing(null);
      load();
    } else {
      setMessage("Update failed.");
    }
  }

  async function uploadCover(editionId: string, file: File) {
    const form = new FormData();
    form.append("cover", file);
    const res = await fetch(`/api/admin/editions/${editionId}`, {
      method: "PUT",
      credentials: "include",
      body: form,
    });
    setMessage(res.ok ? "Cover updated." : "Cover upload failed.");
    if (res.ok) load();
  }

  async function removeEdition(id: string, purge: boolean) {
    if (!confirm(purge ? "Permanently delete this edition?" : "Remove from catalog?")) return;
    const res = await fetch(
      `/api/admin/editions/${id}?mode=${purge ? "purge" : "archive"}`,
      { method: "DELETE", credentials: "include" },
    );
    setMessage(res.ok ? "Edition removed." : "Could not remove edition.");
    if (res.ok) load();
  }

  if (loading) return <p className="text-sm text-muted">Loading editions…</p>;

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-xl border border-border bg-card-muted px-4 py-2 text-sm">{message}</p>
      ) : null}

      {editions.length === 0 ? (
        <p className="text-sm text-muted">No editions yet. Upload a PDF to get started.</p>
      ) : (
        <ul className="space-y-4">
          {editions.map((edition) => (
            <li
              key={edition.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-md shadow-zinc-300/10 dark:shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{edition.title}</h3>
                    {edition.isCurrent ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted">{edition.headline}</p>
                  <p className="mt-1 text-xs text-muted">
                    {edition.pageCount} pages · {edition.storageMb} MB · {edition.id}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewId(edition.id)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-card-muted"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...edition })}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-card-muted"
                  >
                    Edit
                  </button>
                  {!edition.isCurrent ? (
                    <button
                      type="button"
                      onClick={() => void removeEdition(edition.id, false)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-card-muted"
                    >
                      Archive
                    </button>
                  ) : null}
                </div>
              </div>

              <label className="mt-4 inline-flex cursor-pointer text-xs font-medium text-red-600 dark:text-red-400">
                Replace cover image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadCover(edition.id, f);
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Edit edition</h3>
            <div className="mt-4 space-y-3">
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Title"
              />
              <input
                value={editing.headline}
                onChange={(e) => setEditing({ ...editing, headline: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Headline"
              />
              <textarea
                value={editing.summary}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => void saveEdition()}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-w-sm rounded-2xl border border-border bg-card p-4">
            <button
              type="button"
              className="absolute right-3 top-3 text-muted"
              onClick={() => setPreviewId(null)}
            >
              ✕
            </button>
            <p className="mb-3 text-sm font-semibold">Cover preview</p>
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
              <Image
                src={`/api/magazines/${previewId}/cover?v=mobile`}
                alt="Edition cover"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {editions.find((e) => e.id === previewId)?.isCurrent ? (
              <a
                href="/read"
                className="mt-4 block text-center text-sm font-semibold text-red-600 dark:text-red-400"
              >
                Open in reader →
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

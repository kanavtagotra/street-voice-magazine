"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";

type EditionRow = {
  id: string;
  title: string;
  headline: string;
  summary: string;
  pageCount: number;
  publishedAt: string;
  status: "draft" | "published";
  isCurrent: boolean;
  storageMb: number;
};

type EditState = EditionRow;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function toDateInput(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function EditionManager() {
  const { success, error: toastError } = useToast();
  const [editions, setEditions] = useState<EditionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/status", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { editions: EditionRow[] }) => {
        setEditions(
          (data.editions ?? []).map((e) => ({
            ...e,
            status: e.status === "draft" ? "draft" : "published",
          })),
        );
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
        publishedAt: editing.publishedAt,
      }),
    });
    if (res.ok) {
      success("Edition updated.");
      setEditing(null);
      load();
    } else {
      const data = (await res.json()) as { error?: string };
      toastError(data.error ?? "Update failed.");
    }
  }

  async function togglePublish(edition: EditionRow) {
    const nextStatus = edition.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/editions/${edition.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      success(nextStatus === "published" ? "Edition published." : "Edition unpublished.");
      load();
    } else {
      toastError("Could not update publish status.");
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
    if (res.ok) {
      success("Cover updated.");
      load();
    } else {
      toastError("Cover upload failed.");
    }
  }

  async function replacePdf(editionId: string, file: File) {
    setReplacingId(editionId);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/admin/editions/${editionId}`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    setReplacingId(null);
    if (res.ok) {
      success("PDF replaced and reprocessed.");
      load();
    } else {
      const data = (await res.json()) as { error?: string };
      toastError(data.error ?? "PDF replace failed.");
    }
  }

  async function removeEdition(id: string, purge: boolean) {
    if (!confirm(purge ? "Permanently delete this edition?" : "Remove from catalog?")) return;
    const res = await fetch(
      `/api/admin/editions/${id}?mode=${purge ? "purge" : "archive"}`,
      { method: "DELETE", credentials: "include" },
    );
    if (res.ok) {
      success("Edition removed.");
      load();
    } else {
      toastError("Could not remove edition.");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading editions…</p>;
  }

  return (
    <div className="space-y-4">
      {editions.length === 0 ? (
        <p className="text-sm text-muted">No editions yet. Upload a PDF to get started.</p>
      ) : (
        <ul className="space-y-4">
          {editions.map((edition) => (
            <li
              key={edition.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-md shadow-zinc-300/10 dark:shadow-black/20 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{edition.title}</h3>
                    {edition.isCurrent ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                        Current
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        edition.status === "published"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {edition.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{edition.headline}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(edition.publishedAt)} · {edition.pageCount} pages ·{" "}
                    {edition.storageMb} MB
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => setPreviewId(edition.id)}>Preview</ActionButton>
                  <ActionButton onClick={() => setEditing({ ...edition })}>Edit</ActionButton>
                  <ActionButton
                    onClick={() => void togglePublish(edition)}
                    variant={edition.status === "published" ? "muted" : "primary"}
                  >
                    {edition.status === "published" ? "Unpublish" : "Publish"}
                  </ActionButton>
                  {!edition.isCurrent ? (
                    <ActionButton
                      onClick={() => void removeEdition(edition.id, false)}
                      variant="muted"
                    >
                      Archive
                    </ActionButton>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadCover(edition.id, f);
                    }}
                  />
                  Replace cover
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    disabled={replacingId === edition.id}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void replacePdf(edition.id, f);
                    }}
                  />
                  {replacingId === edition.id ? "Replacing PDF…" : "Replace PDF"}
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" />

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl">
            <h3 className="text-lg font-semibold">Edit edition</h3>
            <div className="mt-4 space-y-3">
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                placeholder="Title"
              />
              <input
                value={editing.headline}
                onChange={(e) => setEditing({ ...editing, headline: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                placeholder="Headline"
              />
              <input
                type="date"
                value={toDateInput(editing.publishedAt)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    publishedAt: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
              <textarea
                value={editing.summary}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => void saveEdition()}
                className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative w-full max-w-sm rounded-t-2xl border border-border bg-card p-4 sm:rounded-2xl">
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
                src={`/api/magazines/${previewId}/cover?v=mobile&cv=${Date.now()}`}
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

function ActionButton({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "muted";
}) {
  const styles =
    variant === "primary"
      ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
      : variant === "muted"
        ? "border-border text-muted"
        : "border-border text-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition hover:bg-card-muted ${styles}`}
    >
      {children}
    </button>
  );
}

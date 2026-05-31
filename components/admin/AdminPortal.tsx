"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import type { PublicPdfEdition } from "@/lib/types/pdf-magazine";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AdminPortal() {
  const { success, error: toastError } = useToast();
  const [active, setActive] = useState<PublicPdfEdition | null>(null);
  const [history, setHistory] = useState<PublicPdfEdition[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading">("idle");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/pdf", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/magazines/pdf?scope=all", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([activeRes, allRes]) => {
        setActive((activeRes as { active: PublicPdfEdition | null }).active ?? null);
        setHistory((allRes as { editions: PublicPdfEdition[] }).editions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      toastError("Please select a PDF file.");
      return;
    }

    setPhase("uploading");
    setUploadPercent(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name.replace(/\.pdf$/i, ""));
    formData.append("replace", String(replaceMode));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/pdf/upload");
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadPercent(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setPhase("idle");
      let json: { success?: boolean; error?: string; message?: string } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        toastError("Invalid server response");
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && json.success) {
        success(json.message ?? "Upload complete.");
        setFile(null);
        setTitle("");
        load();
        return;
      }

      toastError(json.error ?? "Upload failed");
    };

    xhr.onerror = () => {
      setPhase("idle");
      toastError("Network error during upload");
    };

    xhr.send(formData);
  }

  async function onDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pdf/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        toastError(json.error ?? "Delete failed");
        return;
      }

      success(json.message ?? "Edition deleted.");
      load();
    } catch {
      toastError("Network error during delete");
    } finally {
      setDeletingId(null);
    }
  }

  const busy = phase !== "idle" || deletingId !== null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Magazine manager</h1>
          <p className="mt-2 text-sm text-muted">
            Upload PDFs to Vercel Blob. The latest upload becomes the active magazine on the home
            page.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-card-muted"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-card-muted"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Currently active PDF
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : active ? (
          <div className="mt-4 space-y-3">
            <p className="text-lg font-semibold">{active.title}</p>
            <p className="text-sm text-muted">
              {formatBytes(active.fileSize)} · Uploaded{" "}
              {new Date(active.uploadedAt).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={active.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                Open PDF
              </a>
              <Link
                href="/"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-card-muted"
              >
                View on home page
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <iframe
                src={active.pdfUrl}
                title={active.title}
                className="h-[480px] w-full bg-white"
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No active magazine yet. Upload a PDF below.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {replaceMode ? "Replace current magazine" : "Upload new magazine"}
        </h2>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={replaceMode}
              onChange={(e) => setReplaceMode(e.target.checked)}
              disabled={busy}
            />
            Replace current active magazine (previous issues stay in archive)
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Edition title (optional)"
            disabled={busy}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
          />

          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={busy}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />

          {phase === "uploading" ? (
            <div className="h-2 overflow-hidden rounded-full bg-card-muted">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950"
          >
            {phase === "uploading"
              ? `Uploading ${uploadPercent}%…`
              : replaceMode
                ? "Replace active PDF"
                : "Upload PDF"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">History</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No editions uploaded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((edition) => (
              <li
                key={edition.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card-muted px-4 py-3"
              >
                <div>
                  <p className="font-medium">{edition.title}</p>
                  <p className="text-xs text-muted">
                    {new Date(edition.uploadedAt).toLocaleString()} · {formatBytes(edition.fileSize)}
                    {edition.isActive ? " · Active" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={edition.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-red-600 dark:text-red-400"
                  >
                    View PDF
                  </a>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(edition.id, edition.title)}
                    className="text-sm font-semibold text-muted transition hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                  >
                    {deletingId === edition.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

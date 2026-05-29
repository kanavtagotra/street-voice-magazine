"use client";

import { useCallback, useState } from "react";
import { EditionList } from "@/components/admin/EditionList";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type UploadResponse = {
  success?: boolean;
  error?: string;
  details?: string;
  hint?: string;
  edition?: { id: string; pageCount: number; storageRoot: string };
  stats?: { processingTimeMs: number; storageBytes: number; pageVariants: string[] };
  log?: { step: string; detail?: string; at: string }[];
};

export function UploadForm() {
  const [secret, setSecret] = useState("");
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [editionId, setEditionId] = useState("");
  const [setAsCurrent, setSetAsCurrent] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [processingLog, setProcessingLog] = useState<UploadResponse["log"] | undefined>(
    undefined,
  );
  const [uploadPercent, setUploadPercent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing">("idle");
  const [refreshKey, setRefreshKey] = useState(0);

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!file || !secret) {
        setStatus("Admin secret and PDF file are required.");
        return;
      }

      setStatus(null);
      setErrorDetails(null);
      setProcessingLog(undefined);
      setUploadPercent(0);
      setPhase("uploading");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("headline", headline);
      formData.append("summary", summary);
      if (editionId) formData.append("id", editionId);
      formData.append("setAsCurrent", String(setAsCurrent));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/upload");
      xhr.setRequestHeader("x-admin-secret", secret);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadPercent(pct);
          setStatus(`Uploading PDF… ${pct}%`);
        }
      };

      xhr.upload.onload = () => {
        setPhase("processing");
        setStatus("Upload complete. Processing PDF on server (render → WebP)…");
      };

      xhr.onload = () => {
        setPhase("idle");
        let json: UploadResponse = {};
        try {
          json = JSON.parse(xhr.responseText) as UploadResponse;
        } catch {
          setStatus("Invalid server response");
          setErrorDetails(xhr.responseText.slice(0, 500));
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && json.success) {
          setProcessingLog(json.log);
          setStatus(
            `Success! ${json.edition?.pageCount} pages → ${json.edition?.storageRoot}. ` +
              `${formatBytes(json.stats?.storageBytes ?? 0)} stored in ` +
              `${((json.stats?.processingTimeMs ?? 0) / 1000).toFixed(1)}s.`,
          );
          setFile(null);
          setRefreshKey((k) => k + 1);
          return;
        }

        setStatus(json.error ?? `Upload failed (${xhr.status})`);
        setErrorDetails(json.details ?? json.hint ?? null);
        setProcessingLog(json.log);
      };

      xhr.onerror = () => {
        setPhase("idle");
        setStatus("Network error during upload");
      };

      xhr.send(formData);
    },
    [file, secret, title, headline, summary, editionId, setAsCurrent],
  );

  const busy = phase !== "idle";

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Admin Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
            placeholder="ADMIN_SECRET from .env.local"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Edition Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm"
              placeholder="April 2026"
              required
              disabled={busy}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Custom ID (optional)
            </label>
            <input
              value={editionId}
              onChange={(e) => setEditionId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm"
              placeholder="april-2026"
              disabled={busy}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Headline
          </label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm"
            placeholder="April Cover Story"
            required
            disabled={busy}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm"
            disabled={busy}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Magazine PDF
          </label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            required
            disabled={busy}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={setAsCurrent}
            onChange={(e) => setSetAsCurrent(e.target.checked)}
            disabled={busy}
            className="rounded border-white/20"
          />
          Set as current edition (stored in storage/current-edition)
        </label>

        {phase === "uploading" ? (
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-white py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
        >
          {phase === "uploading"
            ? `Uploading ${uploadPercent}%…`
            : phase === "processing"
              ? "Processing on server…"
              : "Upload & Process PDF"}
        </button>

        {status ? (
          <p className="rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm leading-relaxed text-zinc-300">
            {status}
          </p>
        ) : null}

        {errorDetails ? (
          <pre className="max-h-48 overflow-auto rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-200">
            {errorDetails}
          </pre>
        ) : null}

        {processingLog && processingLog.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Processing log
            </p>
            <ul className="max-h-40 space-y-1 overflow-auto text-xs text-zinc-400">
              {processingLog.map((entry, i) => (
                <li key={`${entry.at}-${i}`}>
                  <span className="text-zinc-500">{entry.step}</span>
                  {entry.detail ? ` — ${entry.detail}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>

      <div key={refreshKey}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Processed Editions
        </h2>
        <EditionList adminSecret={secret} />
      </div>
    </div>
  );
}

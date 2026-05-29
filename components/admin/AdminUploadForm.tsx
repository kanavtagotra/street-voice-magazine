"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type UploadResponse = {
  success?: boolean;
  error?: string;
  details?: string;
  edition?: { id: string; pageCount: number; status?: string };
  stats?: { processingTimeMs: number; storageBytes: number };
  log?: { step: string; detail?: string; at: string }[];
};

export function AdminUploadForm() {
  const { success, error: toastError } = useToast();
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [editionId, setEditionId] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [setAsCurrent, setSetAsCurrent] = useState(true);
  const [publishNow, setPublishNow] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [processingLog, setProcessingLog] = useState<UploadResponse["log"]>();
  const [uploadPercent, setUploadPercent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing">("idle");

  const onFile = useCallback(
    (next: File | null) => {
      if (next && !next.name.toLowerCase().endsWith(".pdf")) {
        toastError("Only PDF files are supported.");
        return;
      }
      setFile(next);
      setStatus(null);
    },
    [toastError],
  );

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!file) {
        toastError("Please select a PDF file.");
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
      formData.append("publishNow", String(publishNow));
      formData.append("publishedAt", publishedAt);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/upload");
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadPercent(pct);
          setStatus(`Uploading PDF… ${pct}%`);
        }
      };

      xhr.upload.onload = () => {
        setPhase("processing");
        setStatus("Processing on server (cover extract → WebP conversion)…");
      };

      xhr.onload = () => {
        setPhase("idle");
        let json: UploadResponse = {};
        try {
          json = JSON.parse(xhr.responseText) as UploadResponse;
        } catch {
          toastError("Invalid server response");
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && json.success) {
          setProcessingLog(json.log);
          const label = publishNow ? "Published" : "Saved as draft";
          success(
            `${label}! ${json.edition?.pageCount} pages · ${formatBytes(json.stats?.storageBytes ?? 0)} in ${((json.stats?.processingTimeMs ?? 0) / 1000).toFixed(1)}s`,
          );
          setStatus(null);
          setFile(null);
          return;
        }

        toastError(json.error ?? `Upload failed (${xhr.status})`);
        setStatus(json.error ?? `Upload failed (${xhr.status})`);
        setErrorDetails(json.details ?? null);
        setProcessingLog(json.log);
      };

      xhr.onerror = () => {
        setPhase("idle");
        toastError("Network error during upload");
        setStatus("Network error during upload");
      };

      xhr.send(formData);
    },
    [file, title, headline, summary, editionId, setAsCurrent, publishNow, publishedAt, success, toastError],
  );

  const busy = phase !== "idle";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-zinc-300/15 dark:shadow-black/25 sm:p-6"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFile(e.dataTransfer.files[0] ?? null);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition duration-300 sm:p-8 ${
          dragOver
            ? "border-red-500/60 bg-red-50/50 dark:bg-red-950/20"
            : "border-border bg-card-muted"
        }`}
      >
        <p className="text-sm font-medium text-foreground">
          {file ? file.name : "Drag & drop your magazine PDF"}
        </p>
        <p className="mt-1 text-xs text-muted">or browse (max 80MB)</p>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="mt-4 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          disabled={busy}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Edition title" value={title} onChange={setTitle} required disabled={busy} />
        <Field
          label="Custom ID (optional)"
          value={editionId}
          onChange={setEditionId}
          disabled={busy}
          placeholder="april-2026"
        />
      </div>
      <Field label="Headline" value={headline} onChange={setHeadline} required disabled={busy} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Summary
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          disabled={busy}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <Field
        label="Edition date"
        type="date"
        value={publishedAt}
        onChange={setPublishedAt}
        disabled={busy}
      />

      <div className="space-y-3 rounded-xl border border-border bg-card-muted p-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={setAsCurrent}
            onChange={(e) => setSetAsCurrent(e.target.checked)}
            disabled={busy}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Set as current edition</span>
            <span className="mt-0.5 block text-xs text-muted">
              Archives the previous current issue automatically
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(e) => setPublishNow(e.target.checked)}
            disabled={busy}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Publish immediately</span>
            <span className="mt-0.5 block text-xs text-muted">
              Uncheck to save as draft — hidden from the public site until published
            </span>
          </span>
        </label>
      </div>

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
        className="w-full rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
      >
        {phase === "uploading"
          ? `Uploading ${uploadPercent}%…`
          : phase === "processing"
            ? "Processing…"
            : publishNow
              ? "Upload & publish"
              : "Upload as draft"}
      </button>

      {status ? (
        <p className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm">{status}</p>
      ) : null}
      {errorDetails ? (
        <pre className="max-h-40 overflow-auto rounded-xl border border-red-500/30 bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/30 dark:text-red-200">
          {errorDetails}
        </pre>
      ) : null}
      {processingLog?.length ? (
        <ul className="max-h-36 space-y-1 overflow-auto text-xs text-muted">
          {processingLog.map((entry, i) => (
            <li key={`${entry.at}-${i}`}>
              {entry.step}
              {entry.detail ? ` — ${entry.detail}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
      />
    </div>
  );
}

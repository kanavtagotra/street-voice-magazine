import Link from "next/link";
import { PipelineSteps } from "@/components/admin/PipelineSteps";
import { getAllEditionsAdmin, getArchiveEditions, getCurrentEdition } from "@/lib/server/catalog";
import { isBlobStorageEnabled } from "@/lib/server/asset-store";

export default async function AdminOverviewPage() {
  const [current, archive, allEditions] = await Promise.all([
    getCurrentEdition(),
    getArchiveEditions(),
    getAllEditionsAdmin(),
  ]);

  const draftCount = allEditions.filter((e) => e.status === "draft").length;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
          Overview
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Magazine control center</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Upload PDFs, manage editions, and configure homepage content. Assets are stored in{" "}
          {isBlobStorageEnabled() ? "Vercel Blob" : "local storage (dev)"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current edition" value={current?.title ?? "None"} />
        <StatCard label="Published archive" value={String(archive.length)} />
        <StatCard label="Draft editions" value={String(draftCount)} />
        <StatCard label="Pages (current)" value={current ? String(current.pageCount) : "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-zinc-300/15 dark:shadow-black/25 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Quick actions
          </h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/admin/dashboard/upload"
                className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
              >
                Upload new PDF →
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard/editions"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Manage editions →
              </Link>
            </li>
            {current ? (
              <li>
                <Link
                  href="/read"
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Preview reader →
                </Link>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Pipeline
          </h3>
          <PipelineSteps />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-md shadow-zinc-300/15 dark:shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold sm:text-xl">{value}</p>
    </div>
  );
}

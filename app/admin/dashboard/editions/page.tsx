import { EditionManager } from "@/components/admin/EditionManager";

export default function AdminEditionsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
          Catalog
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Manage editions</h2>
        <p className="mt-2 text-sm text-muted">
          Edit metadata, replace cover images, preview editions, or archive issues.
        </p>
      </div>
      <EditionManager />
    </div>
  );
}

import { AdminUploadForm } from "@/components/admin/AdminUploadForm";

export default function AdminUploadPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
          Publish
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Upload magazine PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Upload a PDF to extract the cover, convert pages to WebP, and save as a draft or
          publish immediately. Replace existing editions from the Editions tab.
        </p>
      </div>
      <AdminUploadForm />
    </div>
  );
}

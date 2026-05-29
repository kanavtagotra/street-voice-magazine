import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { readSiteSettings } from "@/lib/server/site-settings";
import { getArchiveEditions, getCurrentEdition } from "@/lib/server/catalog";

export default async function AdminHomepagePage() {
  const [settings, current, archive] = await Promise.all([
    readSiteSettings(),
    getCurrentEdition(),
    getArchiveEditions(),
  ]);

  const editions = [
    ...(current ? [{ id: current.id, title: current.title, isCurrent: true }] : []),
    ...archive.map((e) => ({ id: e.id, title: e.title, isCurrent: false })),
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
          Homepage
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Featured content</h2>
        <p className="mt-2 text-sm text-muted">
          Override hero copy and highlight a featured edition on the homepage.
        </p>
      </div>
      <SiteSettingsForm initial={settings} editions={editions} />
    </div>
  );
}

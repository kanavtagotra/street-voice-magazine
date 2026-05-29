import { promises as fs } from "fs";
import path from "path";
import { STORAGE_ROOT } from "@/lib/server/paths";

export type SiteSettings = {
  heroHeadline?: string;
  heroTagline?: string;
  featuredEditionId?: string | null;
  showStatsStrip?: boolean;
};

const SETTINGS_PATH = path.join(STORAGE_ROOT, "site-settings.json");

const defaults: SiteSettings = {
  featuredEditionId: null,
  showStatsStrip: true,
};

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    return { ...defaults, ...(JSON.parse(raw) as SiteSettings) };
  } catch {
    return { ...defaults };
  }
}

export async function writeSiteSettings(settings: SiteSettings) {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

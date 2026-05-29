import { promises as fs } from "fs";
import path from "path";
import { ARCHIVE_DIR, CURRENT_EDITION_DIR } from "@/lib/server/paths";

/** Clear processed assets in a storage root before re-processing */
export async function clearEditionAssets(storageRoot: string) {
  const targets = [
    path.join(storageRoot, "pages"),
    path.join(storageRoot, "covers"),
    path.join(storageRoot, "cover.webp"),
    path.join(storageRoot, "source.pdf"),
    path.join(storageRoot, "meta.json"),
  ];

  await Promise.all(
    targets.map(async (target) => {
      try {
        await fs.rm(target, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }),
  );

  await fs.mkdir(path.join(storageRoot, "pages"), { recursive: true });
  await fs.mkdir(path.join(storageRoot, "covers"), { recursive: true });
}

/** Move current-edition folder to archive when publishing a new current issue */
export async function archivePreviousCurrentEdition(previousEditionId: string) {
  if (!previousEditionId) return;

  const dest = path.join(ARCHIVE_DIR, previousEditionId);
  try {
    await fs.access(CURRENT_EDITION_DIR);
  } catch {
    return;
  }

  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  try {
    await fs.rm(dest, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  await fs.rename(CURRENT_EDITION_DIR, dest);
}

export async function getDirectorySizeBytes(dirPath: string): Promise<number> {
  let total = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += await getDirectorySizeBytes(full);
      } else if (entry.isFile()) {
        const stat = await fs.stat(full);
        total += stat.size;
      }
    }
  } catch {
    return 0;
  }
  return total;
}

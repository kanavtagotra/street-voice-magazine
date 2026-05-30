import type { ReadingPreferences } from "@/lib/types/user";

export const READING_PREFS_KEY = "sv-reading-prefs";

export function loadReadingPreferences(): ReadingPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READING_PREFS_KEY);
    return raw ? (JSON.parse(raw) as ReadingPreferences) : {};
  } catch {
    return {};
  }
}

export function saveReadingPreferences(preferences: ReadingPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(READING_PREFS_KEY, JSON.stringify(preferences));
}

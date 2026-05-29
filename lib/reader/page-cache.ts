/** In-memory LRU blob URL cache — limits memory for large magazines */

const MAX_ENTRIES = 10;

type CacheEntry = {
  blobUrl: string;
  lastUsed: number;
};

const cache = new Map<string, CacheEntry>();

function cacheKey(page: number, variant: string) {
  return `${page}:${variant}`;
}

export function getCachedBlob(page: number, variant: string) {
  const key = cacheKey(page, variant);
  const hit = cache.get(key);
  if (hit) {
    hit.lastUsed = Date.now();
    return hit.blobUrl;
  }
  return null;
}

export function setCachedBlob(page: number, variant: string, blob: Blob) {
  const key = cacheKey(page, variant);

  if (cache.size >= MAX_ENTRIES) {
    let oldestKey = "";
    let oldest = Infinity;
    for (const [k, v] of cache) {
      if (v.lastUsed < oldest) {
        oldest = v.lastUsed;
        oldestKey = k;
      }
    }
    const evicted = cache.get(oldestKey);
    if (evicted) URL.revokeObjectURL(evicted.blobUrl);
    cache.delete(oldestKey);
  }

  const existing = cache.get(key);
  if (existing) URL.revokeObjectURL(existing.blobUrl);

  const blobUrl = URL.createObjectURL(blob);
  cache.set(key, { blobUrl, lastUsed: Date.now() });
  return blobUrl;
}

export function revokePageBlob(page: number, variant: string) {
  const key = cacheKey(page, variant);
  const entry = cache.get(key);
  if (entry) {
    URL.revokeObjectURL(entry.blobUrl);
    cache.delete(key);
  }
}

export function clearPageCache() {
  for (const entry of cache.values()) {
    URL.revokeObjectURL(entry.blobUrl);
  }
  cache.clear();
}

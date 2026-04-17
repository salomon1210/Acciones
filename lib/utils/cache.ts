import { prisma } from "@/lib/db/prisma";

export type CacheTTL = number; // seconds

export const TTL = {
  quote: 30,
  historical: 60 * 15,
  fundamentals: 60 * 60 * 24,
  filings: 60 * 60 * 24 * 7,
  news: 60 * 5,
  peers: 60 * 60 * 24,
  macro: 60 * 60 * 6,
  crypto: 60,
};

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const row = await prisma.apiCache.findUnique({ where: { key } });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      void prisma.apiCache.delete({ where: { key } }).catch(() => {});
      return null;
    }
    return JSON.parse(row.payload) as T;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, value: T, ttlSec: CacheTTL): Promise<void> {
  const payload = JSON.stringify(value);
  const expiresAt = new Date(Date.now() + ttlSec * 1000);
  try {
    await prisma.apiCache.upsert({
      where: { key },
      create: { key, payload, expiresAt },
      update: { payload, expiresAt },
    });
  } catch {
    // swallow — cache is best-effort
  }
}

export async function cached<T>(
  key: string,
  ttlSec: CacheTTL,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = await readCache<T>(key);
  if (hit !== null) return hit;
  const fresh = await fetcher();
  await writeCache(key, fresh, ttlSec);
  return fresh;
}

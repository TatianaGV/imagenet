import { searchByName } from '../repositories/imagenet.repo';

function clampInt(value: unknown, def: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function searchService(input: { q?: unknown; limit?: unknown }) {
  const q = String(input.q ?? '').trim();
  const limit = clampInt(input.limit, 50, 1, 200);

  if (!q) return { q, items: [] };

  const items = await searchByName({ q, limit });
  return { q, items };
}

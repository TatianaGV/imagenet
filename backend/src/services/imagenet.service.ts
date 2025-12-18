import type { ApiNode, SearchItem } from '../domain/types';
import { fetchNodes, searchByName } from '../repositories/imagenet.repo';

function clampInt(value: unknown, def: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function getNodesService(input: {
  parent?: unknown;
  limit?: unknown;
  offset?: unknown;
}): Promise<{ parent: string; limit: number; offset: number; nodes: ApiNode[] }> {
  const parent = String(input.parent ?? '').trim();
  const limit = clampInt(input.limit, 50, 1, 200);
  const offset = clampInt(input.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const nodes = await fetchNodes({ parent, limit, offset });
  return { parent, limit, offset, nodes };
}

export async function searchService(input: {
  q?: unknown;
  limit?: unknown;
}): Promise<{ q: string; items: SearchItem[] }> {
  const q = String(input.q ?? '').trim();
  const limit = clampInt(input.limit, 50, 1, 200);

  if (!q) return { q, items: [] };

  const items = await searchByName({ q, limit });
  return { q, items };
}

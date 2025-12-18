import { SEP } from '../domain/constants';

export function buildAncestors(fullPath: string): string[] {
  const full = fullPath.trim();
  if (!full) return [];

  const parts = full.split(SEP).map((p) => p.trim()).filter(Boolean);

  const out: string[] = [];
  for (let i = 1; i <= parts.length; i++) {
    out.push(parts.slice(0, i).join(SEP));
  }
  return out;
}

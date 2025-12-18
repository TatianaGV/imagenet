import type { Request, Response } from 'express';
import { buildAncestors } from '../services/ancestors.service';
import { getNodesService, searchService } from '../services/imagenet.service';

export async function getNodes(req: Request, res: Response) {
  const data = await getNodesService({
    parent: req.query.parent,
    limit: req.query.limit,
    offset: req.query.offset,
  });
  res.json(data);
}

export async function search(req: Request, res: Response) {
  const data = await searchService({
    q: req.query.q,
    limit: req.query.limit,
  });
  res.json(data);
}

export function ancestors(req: Request, res: Response) {
  const name = String(req.query.name ?? '').trim();
  const ancestors = buildAncestors(name);
  res.json({ name, ancestors });
}

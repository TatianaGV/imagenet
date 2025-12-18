import type { Express } from 'express';
import { ancestors, getNodes, search } from '../http/imagenet.controller';

const asyncHandler =
  (fn: (req: any, res: any) => Promise<any>) =>
    (req: any, res: any) => {
      Promise.resolve(fn(req, res)).catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
      });
    };

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/api/nodes', asyncHandler(getNodes));
  app.get('/api/search', asyncHandler(search));
  app.get('/api/ancestors', ancestors);
}

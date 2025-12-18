import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Express,
} from 'express';
import { ancestors, getNodes, search } from '../http/imagenet.controller';

const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/api/nodes', asyncHandler(getNodes));
  app.get('/api/search', asyncHandler(search));
  app.get('/api/ancestors', ancestors);
}

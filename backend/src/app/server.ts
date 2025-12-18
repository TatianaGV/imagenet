import express from 'express';
import cors from 'cors';
import type { ErrorRequestHandler } from 'express';
import { registerRoutes } from './routes';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}

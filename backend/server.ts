import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './config/env.ts';
import apiRouter from './routes/index.ts';
import { errorHandler } from './middleware/errorHandler.ts';

export async function createServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount modular API routes under /api
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  // Vite middleware in dev or static files in production
  if (!config.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

export async function startServer() {
  const app = await createServer();
  const PORT = config.port;

  return new Promise<void>((resolve) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Backend] AgentLens Server running on http://0.0.0.0:${PORT} in ${config.nodeEnv} mode`);
      resolve();
    });
  });
}

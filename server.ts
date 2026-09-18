import { startServer } from './backend/server.ts';

startServer().catch((err) => {
  console.error('[Fatal] Failed to launch AgentLens server:', err);
  process.exit(1);
});

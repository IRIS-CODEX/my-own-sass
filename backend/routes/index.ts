import { Router } from 'express';
import healthRoutes from './health.routes.ts';
import usersRoutes from './users.routes.ts';
import agentRoutes from './agent.routes.ts';
import gatewayRoutes from './gateway.routes.ts';
import gmailRoutes from './gmail.routes.ts';
import geminiRoutes from './gemini.routes.ts';

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use(healthRoutes);
apiRouter.use(usersRoutes);
apiRouter.use(agentRoutes);
apiRouter.use(gatewayRoutes);
apiRouter.use(gmailRoutes);
apiRouter.use('/gemini', geminiRoutes);
apiRouter.use(geminiRoutes);

export default apiRouter;

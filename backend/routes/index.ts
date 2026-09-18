import { Router } from 'express';
import healthRoutes from './health.routes.ts';
import usersRoutes from './users.routes.ts';

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use(healthRoutes);
apiRouter.use(usersRoutes);

export default apiRouter;

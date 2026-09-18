import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.ts';

const router = Router();

// Routes for Cloud SQL Users & Subscriptions
router.get('/cloudsql/users', UsersController.getUsers);
router.post('/cloudsql/users', UsersController.upsertUser);
router.post('/cloudsql/sync', UsersController.syncUsers);

export default router;

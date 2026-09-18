import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.ts';

const router = Router();

router.get('/health', HealthController.getHealth);

export default router;

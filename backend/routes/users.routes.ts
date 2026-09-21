import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.ts';
import { CloudSqlDiagnosticController } from '../controllers/cloudSqlDiagnostic.controller.ts';

const router = Router();

// Registration Check & Sign-up Gate
router.get('/cloudsql/users/check', UsersController.checkUser);
router.post('/cloudsql/users/check', UsersController.checkUser);
router.post('/cloudsql/users/register', UsersController.registerUser);

// Routes for Cloud SQL Users & Subscriptions
router.get('/cloudsql/users', UsersController.getUsers);
router.post('/cloudsql/users', UsersController.upsertUser);
router.put('/cloudsql/users/:id', UsersController.updateUser);
router.delete('/cloudsql/users/:id', UsersController.deleteUser);
router.post('/cloudsql/sync', UsersController.syncUsers);

// Routes for Cloud SQL Diagnostic Status & Ping
router.get('/cloudsql/diagnostics', CloudSqlDiagnosticController.getDiagnostics);
router.post('/cloudsql/ping', CloudSqlDiagnosticController.ping);

export default router;



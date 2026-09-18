import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getAllUsersWithSubscriptions, upsertUserAndSubscription } from './src/db/users.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and connectivity check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: 'Cloud SQL PostgreSQL',
      region: 'europe-west1',
      project: 'tranquil-tomorrow-hrtgb',
      time: new Date().toISOString(),
    });
  });

  // Get all registered users and their chosen subscription from Cloud SQL
  app.get('/api/cloudsql/users', async (req, res) => {
    try {
      let users = await getAllUsersWithSubscriptions();

      // If database is completely brand new, seed with hamudijems4@gmail.com as User #1
      if (users.length === 0) {
        await upsertUserAndSubscription({
          uid: 'uid-hamudi-001',
          email: 'hamudijems4@gmail.com',
          displayName: 'Hamudi Jems (Super Admin)',
          organizationName: 'Autonomous Agent Fleet HQ',
          role: 'super-admin',
          authProvider: 'google',
          planTier: 'PRO_MONTHLY',
          monthlyPriceUsd: 199,
          billingInterval: 'monthly',
          status: 'ACTIVE',
          requestLimit: 250000,
          requestsUsed: 42390,
          activeAgentsCount: 5,
          virtualKeysCount: 4,
        });

        // Seed companion demo users
        await upsertUserAndSubscription({
          uid: 'uid-sarah-002',
          email: 'sarah.chen@novabiotech.io',
          displayName: 'Sarah Chen (Lead Scientist)',
          organizationName: 'Nova BioTech Labs',
          role: 'owner',
          authProvider: 'email',
          planTier: 'ENTERPRISE',
          monthlyPriceUsd: 599,
          billingInterval: 'monthly',
          status: 'ACTIVE',
          requestLimit: 2000000,
          requestsUsed: 310500,
          activeAgentsCount: 18,
          virtualKeysCount: 12,
        });

        users = await getAllUsersWithSubscriptions();
      }

      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error: any) {
      console.error('Failed to query Cloud SQL users:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users from Cloud SQL',
      });
    }
  });

  // Upsert a registered user and their chosen subscription
  app.post('/api/cloudsql/users', async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      const uid = payload.uid || `user-${Date.now()}`;
      const result = await upsertUserAndSubscription({
        ...payload,
        uid,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Failed to upsert user in Cloud SQL:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upsert user into Cloud SQL database',
      });
    }
  });

  // Batch sync registered users from Main Admin into Cloud SQL
  app.post('/api/cloudsql/sync', async (req, res) => {
    try {
      const { users: userList } = req.body;
      if (!Array.isArray(userList)) {
        return res.status(400).json({ success: false, error: 'users array is required' });
      }

      const results = [];
      for (const u of userList) {
        const synced = await upsertUserAndSubscription({
          uid: u.uid || u.id || `uid-${Date.now()}`,
          email: u.email,
          displayName: u.displayName || u.name,
          organizationName: u.organizationName,
          role: u.role || 'owner',
          authProvider: u.authProvider || (u.email?.endsWith('@gmail.com') ? 'google' : 'email'),
          planTier: u.planTier || u.subscription?.planTier || 'PRO_MONTHLY',
          monthlyPriceUsd: u.monthlyPriceUsd ?? u.subscription?.monthlyPriceUsd,
          billingInterval: u.billingInterval || 'monthly',
          status: u.status || 'ACTIVE',
          requestLimit: u.requestLimit,
          requestsUsed: u.requestsUsed,
          activeAgentsCount: u.activeAgentsCount,
          virtualKeysCount: u.virtualKeysCount,
        });
        results.push(synced);
      }

      const allUsers = await getAllUsersWithSubscriptions();
      res.json({
        success: true,
        syncedCount: results.length,
        totalInDatabase: allUsers.length,
        users: allUsers,
      });
    } catch (error: any) {
      console.error('Failed to sync users to Cloud SQL:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sync users to Cloud SQL',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT} with Cloud SQL`);
  });
}

startServer();

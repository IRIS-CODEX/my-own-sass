import { Request, Response } from 'express';
import { UsersService } from '../services/users.service.ts';

export class UsersController {
  /**
   * GET /api/cloudsql/users/check?email=...
   * POST /api/cloudsql/users/check { email }
   * Verify if a user is registered before allowing login
   */
  static async checkUser(req: Request, res: Response) {
    try {
      const email = (req.query.email as string) || req.body?.email;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required for registration check',
        });
      }

      const result = await UsersService.checkUserRegistrationStatus(email);
      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('UsersController.checkUser error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to verify user registration in Cloud SQL',
      });
    }
  }

  /**
   * POST /api/cloudsql/users/register
   * Full sign up registration with detail forms and package selection
   */
  static async registerUser(req: Request, res: Response) {
    try {
      const payload = req.body;
      if (!payload || !payload.email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required for registration',
        });
      }

      const uid = payload.uid || `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const result = await UsersService.upsertUserAndSubscription({
        ...payload,
        uid,
      });

      res.status(201).json({
        success: true,
        message: 'User successfully registered and package activated in Cloud SQL',
        data: result,
      });
    } catch (error: any) {
      console.error('UsersController.registerUser error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete registration in Cloud SQL',
      });
    }
  }

  /**
   * GET /api/cloudsql/users
   * Returns list of all registered users and their subscriptions
   */
  static async getUsers(req: Request, res: Response) {
    try {
      await UsersService.seedInitialUsersIfEmpty();
      const users = await UsersService.getAllUsersWithSubscriptions();

      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error: any) {
      console.error('UsersController.getUsers error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users from Cloud SQL',
      });
    }
  }

  /**
   * POST /api/cloudsql/users
   * Upsert a user and their selected subscription plan
   */
  static async upsertUser(req: Request, res: Response) {
    try {
      const payload = req.body;
      if (!payload || !payload.email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      const uid = payload.uid || `user-${Date.now()}`;
      const result = await UsersService.upsertUserAndSubscription({
        ...payload,
        uid,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('UsersController.upsertUser error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upsert user into Cloud SQL',
      });
    }
  }

  /**
   * PUT /api/cloudsql/users/:id
   * Update user details or subscription
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const result = await UsersService.updateUser(userId, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('UsersController.updateUser error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update user',
      });
    }
  }

  /**
   * DELETE /api/cloudsql/users/:id
   * Delete a user from database
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const deleted = await UsersService.deleteUser(userId);
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error('UsersController.deleteUser error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete user',
      });
    }
  }

  /**
   * POST /api/cloudsql/sync
   * Batch synchronize users from Admin Portal to Cloud SQL
   */
  static async syncUsers(req: Request, res: Response) {
    try {
      const { users: userList } = req.body;
      if (!Array.isArray(userList)) {
        return res.status(400).json({
          success: false,
          error: 'users array is required in request payload',
        });
      }

      const results = [];
      for (const u of userList) {
        const synced = await UsersService.upsertUserAndSubscription({
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

      const allUsers = await UsersService.getAllUsersWithSubscriptions();
      res.json({
        success: true,
        syncedCount: results.length,
        totalInDatabase: allUsers.length,
        users: allUsers,
      });
    } catch (error: any) {
      console.error('UsersController.syncUsers error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sync users to Cloud SQL',
      });
    }
  }
}


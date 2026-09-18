import { Request, Response } from 'express';
import { config } from '../config/env.ts';
import { pool } from '../db/index.ts';

export class HealthController {
  static async getHealth(req: Request, res: Response) {
    let dbStatus = 'connected';
    try {
      if (pool) {
        await pool.query('SELECT 1');
      }
    } catch (e: any) {
      dbStatus = `degraded: ${e.message}`;
    }

    res.json({
      status: 'ok',
      service: 'AgentLens Fleet Backend API',
      database: 'Cloud SQL PostgreSQL',
      region: config.gcp.region,
      project: config.gcp.project,
      dbStatus,
      uptime: process.uptime(),
      time: new Date().toISOString(),
    });
  }
}

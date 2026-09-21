import { Request, Response } from 'express';
import { pool, db } from '../db/index.ts';
import { config } from '../config/env.ts';

export interface CloudSqlDiagnosticResponse {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  database: string;
  host: string;
  user: string;
  engine: string;
  region: string;
  project: string;
  ssl: boolean;
  serverTime: string;
  pool: {
    total: number;
    idle: number;
    waiting: number;
    max: number;
  };
  tables: {
    name: string;
    verified: boolean;
    rowCount: number;
    error?: string;
  }[];
  lastChecked: string;
  errorMessage?: string;
}

export class CloudSqlDiagnosticController {
  /**
   * GET /api/cloudsql/diagnostics
   * Performs real-time latency benchmark, queries version, pool metrics, and table health
   */
  static async getDiagnostics(req: Request, res: Response) {
    const startTime = performance.now();
    let status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
    let engine = 'PostgreSQL (Cloud SQL)';
    let serverTime = new Date().toISOString();
    let errorMessage: string | undefined;
    let tablesInfo: { name: string; verified: boolean; rowCount: number; error?: string }[] = [];

    const expectedTables = [
      'users',
      'subscriptions',
      'agents',
      'chat_sessions',
      'chat_messages',
      'agent_memories',
      'agent_executions',
    ];

    try {
      if (!pool) {
        throw new Error('Database connection pool is not initialized');
      }

      // Step 1: Benchmark direct query roundtrip
      const pingResult = await pool.query('SELECT NOW() as now, version() as ver, current_database() as db_name, current_user as db_user');
      serverTime = pingResult.rows[0]?.now ? new Date(pingResult.rows[0].now).toISOString() : new Date().toISOString();
      engine = pingResult.rows[0]?.ver || engine;

      // Step 2: Query count & health for each table
      for (const tableName of expectedTables) {
        try {
          // Check existence and row count
          const countRes = await pool.query(`SELECT COUNT(*)::int as count FROM "${tableName}"`);
          const rowCount = countRes.rows[0]?.count ?? 0;
          tablesInfo.push({
            name: tableName,
            verified: true,
            rowCount: Number(rowCount),
          });
        } catch (tableErr: any) {
          // Table might not exist yet or have different casing
          tablesInfo.push({
            name: tableName,
            verified: false,
            rowCount: 0,
            error: tableErr.message || 'Table verification error',
          });
        }
      }

      const latencyMs = Math.round(performance.now() - startTime);
      status = latencyMs > 500 ? 'DEGRADED' : 'ONLINE';

      const responseData: CloudSqlDiagnosticResponse = {
        status,
        latencyMs,
        database: config.db.database || 'defaultdb',
        host: config.db.host || 'localhost',
        user: config.db.user || 'postgres',
        engine: engine.split(' on ')[0] || 'PostgreSQL 16 (Google Cloud SQL)',
        region: config.gcp.region || 'europe-west2',
        project: config.gcp.project || 'agentlens-cloudsql',
        ssl: true,
        serverTime,
        pool: {
          total: pool.totalCount || 0,
          idle: pool.idleCount || 0,
          waiting: pool.waitingCount || 0,
          max: 10,
        },
        tables: tablesInfo,
        lastChecked: new Date().toISOString(),
      };

      return res.json({ success: true, data: responseData });
    } catch (err: any) {
      console.error('[CloudSqlDiagnosticController] Diagnostics failed:', err);
      const latencyMs = Math.round(performance.now() - startTime);

      const responseData: CloudSqlDiagnosticResponse = {
        status: 'OFFLINE',
        latencyMs,
        database: config.db.database || 'defaultdb',
        host: config.db.host || 'localhost',
        user: config.db.user || 'postgres',
        engine: 'Cloud SQL PostgreSQL (Unreachable)',
        region: config.gcp.region || 'europe-west2',
        project: config.gcp.project || 'agentlens-cloudsql',
        ssl: false,
        serverTime: new Date().toISOString(),
        pool: {
          total: pool?.totalCount || 0,
          idle: pool?.idleCount || 0,
          waiting: pool?.waitingCount || 0,
          max: 10,
        },
        tables: expectedTables.map((t) => ({ name: t, verified: false, rowCount: 0 })),
        lastChecked: new Date().toISOString(),
        errorMessage: err.message || 'Database connection timeout',
      };

      return res.status(200).json({ success: false, data: responseData });
    }
  }

  /**
   * POST /api/cloudsql/ping
   * Quick ping test
   */
  static async ping(req: Request, res: Response) {
    const start = performance.now();
    try {
      if (!pool) throw new Error('Pool missing');
      await pool.query('SELECT 1');
      const latencyMs = Math.round(performance.now() - start);
      return res.json({ success: true, status: 'ONLINE', latencyMs, timestamp: new Date().toISOString() });
    } catch (e: any) {
      return res.json({ success: false, status: 'OFFLINE', latencyMs: Math.round(performance.now() - start), error: e.message });
    }
  }
}

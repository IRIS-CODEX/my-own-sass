import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import { config } from '../config/env.ts';

// Global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool using the Object Method
export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance lazily
export const pool = createPool();

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

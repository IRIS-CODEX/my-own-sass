import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  db: {
    host: process.env.SQL_HOST || '127.0.0.1',
    user: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || '',
    name: process.env.SQL_DB_NAME || 'postgres',
    database: process.env.SQL_DB_NAME || 'postgres',
    maxPoolSize: 10,
    connectionTimeoutMillis: 15000,
  },
  sql: {
    host: process.env.SQL_HOST || '127.0.0.1',
    user: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || '',
    database: process.env.SQL_DB_NAME || 'postgres',
    maxPoolSize: 10,
    connectionTimeoutMillis: 15000,
  },
  gcp: {
    project: 'tranquil-tomorrow-hrtgb',
    region: 'europe-west1',
    firestoreDb: 'ai-studio-agentlens-0fb39807-62d1-453b-be9a-0a9fb50dd3e8',
  },
};

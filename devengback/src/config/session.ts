import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// Configure PostgreSQL pool for session store
const pgPool = new Pool({
  user: process.env.DB_USER || 'your-db-user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'deviation_engine',
  password: process.env.DB_PASSWORD || 'your-db-password',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

// Handle pool errors
pgPool.on('error', (err: Error) => {
  logger.error('PostgreSQL pool error:', err);
});

// Configure session with connect-pg-simple
const PgSession = connectPgSimple(session);
const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET || 'a_default_secret_for_development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

export default sessionMiddleware;

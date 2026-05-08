import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// Get database configuration from environment variables
const dbName = process.env.DB_NAME || 'deviation_engine';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');
const dbSSL = process.env.DB_SSL === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const isAWSRDS = dbHost.includes('rds.amazonaws.com');

const logging = (msg: string) => {
  if (process.env.NODE_ENV !== 'production') {
    // logger.debug(msg);
  }
};

// Create Sequelize instance with proper SSL configuration for AWS RDS
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  dialectOptions: {
    // Force SSL for AWS RDS or when DB_SSL is true
    ssl: (dbSSL || isAWSRDS) ? {
      require: true,
      rejectUnauthorized: false // AWS RDS certificates are self-signed
    } : false,
    // Ensure connection uses SSL
    ...(dbSSL || isAWSRDS ? {
      sslmode: 'require'
    } : {})
  },
  logging,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Add retry logic for connection issues
  retry: {
    match: [
      /ECONNRESET/,
      /ENOTFOUND/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /no pg_hba.conf entry/
    ],
    max: 3
  }
});

// Test the connection on startup
sequelize.authenticate()
  .then(() => {
    logger.info(` Database connection established successfully to ${dbHost}:${dbPort}`);
    logger.info(`SSL enabled: ${dbSSL || isAWSRDS}`);
  })
  .catch(err => {
    logger.error('❌ Unable to connect to database:', err);
    logger.error(`Connection details: ${dbUser}@${dbHost}:${dbPort}/${dbName} SSL:${dbSSL || isAWSRDS}`);
  });

export default sequelize;
#!/usr/bin/env node
const { exec } = require('child_process');
const dotenv = require('dotenv');
const { Client } = require('pg');
const path = require('path');
const winston = require('winston');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join('logs', 'db-init.log') })
  ]
});

// Get database configuration from environment variables
const dbName = process.env.DB_NAME || 'deviation_engine';
// On macOS, the default user is often the system username
const defaultUser = process.env.USER || 'postgres';
const dbUser = process.env.DB_USER || defaultUser;
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbSSL = process.env.DB_SSL === 'true';

// Connect to PostgreSQL server (default database)
const client = new Client({
  user: dbUser,
  password: dbPassword,
  host: dbHost,
  port: dbPort,
  database: 'postgres', // Connect to default database first
  ssl: dbSSL ? {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false
});

async function createDatabase() {
  logger.info(`Attempting to create database: ${dbName}`);
  
  try {
    await client.connect();
    logger.info('Connected to PostgreSQL server');

    // Check if database exists
    const checkRes = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    
    if (checkRes.rowCount === 0) {
      // Create database if it doesn't exist
      logger.info(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      logger.info(`Database ${dbName} created successfully`);
    } else {
      logger.info(`Database ${dbName} already exists`);
    }

    // Close connection
    await client.end();
    logger.info('Connection closed');

    // Run migrations
    logger.info('Running migrations...');
    exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
      if (error) {
        logger.error(`Migration error: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.error(`Migration stderr: ${stderr}`);
        return;
      }
      logger.info('Migrations completed successfully');
      logger.debug(`Migration output: ${stdout}`);
    });

  } catch (error) {
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
}

createDatabase(); 
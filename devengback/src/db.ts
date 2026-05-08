import sequelize from './config/database';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL database connection established successfully');
  } catch (error) {
    logger.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB; 
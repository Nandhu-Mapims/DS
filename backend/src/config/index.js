import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/discharge-summary-db',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  sarvamApiKey: process.env.SARVAM_API_KEY || '',
};

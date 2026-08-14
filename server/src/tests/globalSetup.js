import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Runs once before all test suites are executed
 */
export default async function globalSetup() {
  // Load test env
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
  
  console.log('[Global Setup] Synchronizing test PostgreSQL database schema...');
  try {
    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });
    console.log('[Global Setup] Database schema sync completed successfully.');
  } catch (error) {
    console.error('[Global Setup Error] Failed to sync database schema:', error);
    throw error;
  }
}

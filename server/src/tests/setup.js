import dotenv from 'dotenv';
import path from 'path';

// Force load .env.test before any Prisma client initializes
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

import prisma from '../config/database.js';

beforeEach(async () => {
  // Clean all data to isolate test states
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

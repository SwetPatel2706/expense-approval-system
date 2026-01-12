// server/prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // -----------------------------
  // Seed Users (idempotent)
  // -----------------------------
  await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: {
      id: 'user-1',
      email: 'employee@example.com',
      role: 'EMPLOYEE',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-2' },
    update: {},
    create: {
      id: 'user-2',
      email: 'manager@example.com',
      role: 'MANAGER',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-3' },
    update: {},
    create: {
      id: 'user-3',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  });

  // -----------------------------
  // Seed Expenses
  // -----------------------------
  await prisma.expense.createMany({
    data: [
      {
        amount: 1200.50,
        currency: 'USD',
        category: 'TRAVEL',
        status: 'PENDING',
        userId: 'user-1',
      },
      {
        amount: 300.00,
        currency: 'USD',
        category: 'MEALS',
        status: 'PENDING',
        userId: 'user-1',
      },
      {
        amount: 4500.00,
        currency: 'INR',
        category: 'EQUIPMENT',
        status: 'PENDING',
        userId: 'user-1',
      },
    ],
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

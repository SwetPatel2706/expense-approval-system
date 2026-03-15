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
      companyId: 'company-0001',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-2' },
    update: {},
    create: {
      id: 'user-2',
      email: 'manager@example.com',
      role: 'MANAGER',
      companyId: 'company-0001',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-3' },
    update: {},
    create: {
      id: 'user-3',
      email: 'admin@example.com',
      role: 'ADMIN',
      companyId: 'company-0001',
    },
  });

  // -----------------------------
  // Seed Expenses
  // -----------------------------
  await prisma.expense.upsert({
    where: { id: 'expense-1' },
    update: {},
    create: {
      id: 'expense-1',
      amount: 1200.5,
      currency: 'USD',
      category: 'TRAVEL',
      status: 'PENDING',
      userId: 'user-1',
      companyId: 'company-0001',
    },
  });

  await prisma.expense.upsert({
    where: { id: 'expense-2' },
    update: {},
    create: {
      id: 'expense-2',
      amount: 300.0,
      currency: 'USD',
      category: 'MEALS',
      status: 'PENDING',
      userId: 'user-1',
      companyId: 'company-0001',
    },
  });

  await prisma.expense.upsert({
    where: { id: 'expense-3' },
    update: {},
    create: {
      id: 'expense-3',
      amount: 4500.0,
      currency: 'INR',
      category: 'EQUIPMENT',
      status: 'PENDING',
      userId: 'user-1',
      companyId: 'company-0001',
    },
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

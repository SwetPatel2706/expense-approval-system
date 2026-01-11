// server/prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const users = await prisma.user.createMany({
    data: [
      {
        id: 'user-1',
        email: 'employee@test.com',
        role: 'EMPLOYEE',
      },
      {
        id: 'user-2',
        email: 'manager@test.com',
        role: 'MANAGER',
      },
      {
        id: 'user-3',
        email: 'admin@test.com',
        role: 'ADMIN',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Users seeded:', users.count);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

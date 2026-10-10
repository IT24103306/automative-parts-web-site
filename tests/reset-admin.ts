import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Wipe all admins
  await prisma.admin.deleteMany();
  
  // Create test admin
  await prisma.admin.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Test Admin'
    }
  });
  console.log("Admin reset to admin@test.com / password123");
}

main().finally(() => prisma.$disconnect());

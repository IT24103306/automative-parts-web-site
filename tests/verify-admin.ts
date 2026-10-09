import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findUnique({
    where: { email: 'admin@test.com' }
  });

  if (admin) {
    console.log('✅ Admin found in database!');
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Password Hash (partial): ${admin.password.substring(0, 15)}...`);
  } else {
    console.log('❌ Admin not found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

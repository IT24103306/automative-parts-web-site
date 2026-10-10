import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching admin records...');
  const admins = await prisma.admin.findMany();
  console.log(`Found ${admins.length} admins.`);

  for (const admin of admins) {
    console.log(`\nAdmin ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Password Hash: ${admin.password}`);
    
    // Check if it's a valid bcrypt hash
    const isBcryptHash = admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$');
    console.log(`Is valid bcrypt hash format? ${isBcryptHash}`);
    
    // Test if 'password123' works for this hash
    if (isBcryptHash) {
      const testMatch = await bcrypt.compare('password123', admin.password);
      console.log(`Matches 'password123'? ${testMatch}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

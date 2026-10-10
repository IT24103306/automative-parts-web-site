import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>');
    process.exit(1);
  }

  const [email, newPassword] = args;

  console.log(`Looking up admin with email: ${email}`);
  
  const admin = await prisma.admin.findUnique({
    where: { email }
  });

  if (!admin) {
    console.error(`Error: Admin with email '${email}' not found.`);
    console.error('Available admin accounts:');
    const allAdmins = await prisma.admin.findMany({ select: { email: true } });
    allAdmins.forEach(a => console.error(` - ${a.email}`));
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('Error: New password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log('Generating secure bcrypt hash...');
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  console.log('Updating database record...');
  await prisma.admin.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log('\nSuccess! Password has been securely reset.');
  console.log(`You can now log in at the production URL with the email: ${email}`);
}

main()
  .catch(e => {
    console.error('Database connection or execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Utility for secure hidden password prompt
const askPassword = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Intercept stdout to prevent echoing characters (except for the prompt and newlines)
    (rl as any)._writeToOutput = function _writeToOutput(stringToWrite: string) {
      if (stringToWrite.includes(query) || stringToWrite === '\r\n' || stringToWrite === '\n') {
        process.stdout.write(stringToWrite);
      } else {
        process.stdout.write('*'); // mask with asterisk
      }
    };

    rl.question(query, (password) => {
      rl.close();
      resolve(password.trim());
    });
  });
};

const askConfirm = (query: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npx tsx scripts/reset-admin-password.ts <email>');
    process.exit(1);
  }

  // Database verification
  const dbUrl = process.env.DATABASE_URL || '';
  console.log(`\n--- Environment Check ---`);
  console.log(`Target Database Host: ${dbUrl.split('@').pop()?.split('/')[0] || 'Unknown'}`);
  
  const isProduction = dbUrl.includes('aivencloud.com') || dbUrl.includes('aiven');
  
  if (!isProduction) {
    console.warn(`\nWARNING: The current DATABASE_URL appears to be LOCAL (not Aiven production).`);
    console.warn(`If you intend to reset the production password, you must set the DATABASE_URL to your Aiven MySQL connection string first.`);
  } else {
    console.log(`\nSUCCESS: Verified connection targeting production Aiven database.`);
  }

  const proceed = await askConfirm('\nDo you want to proceed with this database? (y/N): ');
  if (!proceed) {
    console.log('Aborted.');
    process.exit(0);
  }

  console.log(`\nLooking up admin with email: ${email}`);
  
  const admin = await prisma.admin.findUnique({
    where: { email }
  });

  if (!admin) {
    console.error(`Error: Admin with email '${email}' not found.`);
    process.exit(1);
  }

  const newPassword = await askPassword('Enter NEW password (input will be hidden): ');
  const confirmPassword = await askPassword('Confirm NEW password: ');

  if (newPassword !== confirmPassword) {
    console.error('Error: Passwords do not match.');
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
}

main()
  .catch(e => {
    console.error('Database connection or execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

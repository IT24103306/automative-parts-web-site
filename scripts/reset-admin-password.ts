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
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(dbUrl);
  } catch (err) {
    console.error('Error: DATABASE_URL is not a valid URL.');
    console.error('If your password contains special characters like #, ?, or @, they must be URL-encoded (e.g., %40 for @, %23 for #).');
    console.error('Also ensure you do not have accidental duplicates like "mysql://mysql://".');
    process.exit(1);
  }

  const host = parsedUrl.hostname;
  console.log(`Target Database Host: ${host}`);
  
  const expectedProductionHost = 'mysql-1b89c581-thuvarakanthuva73-29e9.g.aivencloud.com';
  
  if (host !== expectedProductionHost) {
    console.error(`\nERROR: Hostname mismatch!`);
    console.error(`Expected: ${expectedProductionHost}`);
    console.error(`Actual:   ${host}`);
    console.error(`\nStopping. This script is strictly locked to the production database to prevent accidental local data modification.`);
    process.exit(1);
  }

  console.log(`\nSUCCESS: Verified strict connection to the exact production Aiven database.`);

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

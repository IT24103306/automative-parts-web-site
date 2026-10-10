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

// We defer PrismaClient initialization so we can dynamically pass the URL
async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npx tsx scripts/reset-admin-password.ts <email>');
    process.exit(1);
  }

  console.log(`\n--- Environment Check ---`);
  console.log(`To protect your local .env file, we will connect directly to production.`);
  
  const expectedProductionHost = 'mysql-1b89c581-thuvarakanthuva73-29e9.g.aivencloud.com';
  let dbUrl = process.env.DATABASE_URL || '';
  
  // Ask for the URL securely if it's not the production one
  if (!dbUrl.includes(expectedProductionHost)) {
    dbUrl = await askPassword('\nPlease paste your exact Aiven production DATABASE_URL (input will be hidden): ');
  }
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL is required.');
    process.exit(1);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(dbUrl);
  } catch (err) {
    console.error('\nError: DATABASE_URL is not a valid URL.');
    console.error('If your password contains special characters like #, ?, or @, they must be URL-encoded (e.g., %40 for @, %23 for #).');
    process.exit(1);
  }

  const host = parsedUrl.hostname;
  console.log(`Target Database Host: ${host}`);
  
  if (host !== expectedProductionHost) {
    console.error(`\nERROR: Hostname mismatch!`);
    console.error(`Expected: ${expectedProductionHost}`);
    console.error(`Actual:   ${host}`);
    process.exit(1);
  }

  console.log(`\nSUCCESS: Verified strict connection to the exact production Aiven database.`);

  const proceed = await askConfirm('\nDo you want to proceed with this database? (y/N): ');
  if (!proceed) {
    console.log('Aborted.');
    process.exit(0);
  }

  // Initialize Prisma strictly with the verified production URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  });

  try {
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
  } catch (e) {
    console.error('Database connection or execution failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

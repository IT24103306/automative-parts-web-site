import { PrismaClient } from '@prisma/client';
import { URL } from 'url';

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('--- Diagnostic: Environment Variable Parsing ---');
  
  try {
    // Attempt to parse the URL using Node's native URL parser
    const parsedUrl = new URL(dbUrl);
    
    console.log(`Protocol: ${parsedUrl.protocol}`);
    console.log(`Host: ${parsedUrl.hostname}`);
    console.log(`Port: ${parsedUrl.port || 'default'}`);
    console.log(`Pathname: ${parsedUrl.pathname}`);
    
    if (parsedUrl.hostname === 'mysql' && parsedUrl.pathname.startsWith('//')) {
      console.error('\n⚠️ FATAL CONFIGURATION ERROR DETECTED ⚠️');
      console.error('Your DATABASE_URL starts with "mysql://mysql://".');
      console.error('The double "mysql://" causes Prisma to interpret the host as "mysql" and default to port 3306.');
      console.error('Please remove the duplicate "mysql://" from the beginning of your connection string.');
      process.exit(1);
    }
  } catch (e: any) {
    console.error('Failed to parse DATABASE_URL as a valid URL format:', e.message);
  }

  console.log('\n--- Diagnostic: Read-Only Connection Test ---');
  console.log('Initializing Prisma Client...');
  
  const prisma = new PrismaClient();
  
  try {
    console.log('Attempting to connect to the database (timeout 10s)...');
    
    // Test connection by fetching a single record
    const adminCount = await prisma.admin.count();
    
    console.log('✅ SUCCESS: Successfully connected to the database!');
    console.log(`Read-only test passed. Found ${adminCount} admin records.`);
  } catch (error: any) {
    console.error('❌ FAILURE: Prisma failed to connect to the database.');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

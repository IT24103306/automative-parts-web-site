import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========================================================');
  console.log('📦 NG MOTORS SAFE DATABASE RESTORATION & SYNC TOOL');
  console.log('========================================================\n');

  // Allow passing the database URL as an argument or env var
  const targetDbUrl = process.argv[2] || process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

  if (!targetDbUrl) {
    console.error('❌ ERROR: No target DATABASE_URL provided.');
    console.error('Usage: npx tsx scripts/restore-from-backup.ts "<mysql_connection_string>"');
    process.exit(1);
  }

  // Sanitize and display target info without revealing password
  try {
    const parsed = new URL(targetDbUrl);
    console.log(`Connecting to Target Database:`);
    console.log(`  Host:     ${parsed.hostname}`);
    console.log(`  Port:     ${parsed.port || '3306'}`);
    console.log(`  Database: ${parsed.pathname.replace(/^\//, '')}`);
    console.log(`  Protocol: ${parsed.protocol}\n`);
  } catch {
    console.log('Connecting to target database (custom format)...\n');
  }

  const backupFilePath = path.resolve(process.cwd(), 'backups', 'local-data-backup.json');
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ ERROR: Backup file not found at ${backupFilePath}`);
    process.exit(1);
  }

  const rawBackup = fs.readFileSync(backupFilePath, 'utf8');
  const backup = JSON.parse(rawBackup);
  const data = backup.data;

  console.log(`Backup loaded successfully from: ${backupFilePath}`);
  console.log(`Exported timestamp: ${backup.exportedAt}`);
  console.log('Records to sync:', backup.counts, '\n');

  // Initialize Prisma targeting the specified database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: targetDbUrl,
      },
    },
  });

  try {
    console.log('1. Testing database connectivity (probe query)...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connection established successfully!\n');

    // 1. Admins
    console.log(`2. Syncing Admins (${data.admins.length})...`);
    for (const admin of data.admins) {
      await prisma.admin.upsert({
        where: { id: admin.id },
        update: {},
        create: {
          id: admin.id,
          email: admin.email,
          password: admin.password,
          name: admin.name,
          createdAt: new Date(admin.createdAt),
          updatedAt: new Date(admin.updatedAt),
        },
      });
    }

    // 2. SiteSettings
    console.log(`3. Syncing SiteSettings (${data.siteSettings.length})...`);
    for (const setting of data.siteSettings) {
      await prisma.siteSettings.upsert({
        where: { id: setting.id },
        update: {},
        create: {
          id: setting.id,
          companyName: setting.companyName,
          storeName: setting.storeName,
          address: setting.address,
          phone: setting.phone,
          whatsapp: setting.whatsapp,
          email: setting.email || '',
          businessHours: setting.businessHours,
          socialLinks: setting.socialLinks,
          codEnabled: setting.codEnabled,
          bankTransferEnabled: setting.bankTransferEnabled,
          bankName: setting.bankName,
          bankAccountName: setting.bankAccountName,
          bankAccountNumber: setting.bankAccountNumber,
          bankBranch: setting.bankBranch,
          paymentInstructions: setting.paymentInstructions,
          lowStockThreshold: setting.lowStockThreshold || 5,
          seoSettings: setting.seoSettings,
          footerContent: setting.footerContent,
          updatedAt: new Date(setting.updatedAt),
        },
      });
    }

    // 3. Categories
    console.log(`4. Syncing Categories (${data.categories.length})...`);
    for (const cat of data.categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          order: cat.order || 0,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
        },
      });
    }

    // 4. Products
    console.log(`5. Syncing Products (${data.products.length})...`);
    for (const prod of data.products) {
      await prisma.product.upsert({
        where: { id: prod.id },
        update: {},
        create: {
          id: prod.id,
          name: prod.name,
          partNumber: prod.partNumber,
          SKU: prod.SKU,
          brand: prod.brand,
          categoryId: prod.categoryId,
          description: prod.description,
          specifications: prod.specifications,
          compatibility: prod.compatibility,
          vehicleMake: prod.vehicleMake,
          vehicleModel: prod.vehicleModel,
          vehicleYear: prod.vehicleYear,
          engine: prod.engine,
          fuelType: prod.fuelType,
          transmission: prod.transmission,
          stockQuantity: prod.stockQuantity || 0,
          lowStockThreshold: prod.lowStockThreshold || 5,
          availability: prod.availability || 'AVAILABLE',
          featured: prod.featured || false,
          active: prod.active !== undefined ? prod.active : true,
          createdAt: new Date(prod.createdAt),
          updatedAt: new Date(prod.updatedAt),
        },
      });
    }

    // 5. Product Images
    console.log(`6. Syncing Product Images (${data.productImages.length})...`);
    for (const img of data.productImages) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: {},
        create: {
          id: img.id,
          productId: img.productId,
          url: img.url,
          isPrimary: img.isPrimary || false,
          order: img.order || 0,
          createdAt: new Date(img.createdAt),
        },
      });
    }

    // 6. Customers
    console.log(`7. Syncing Customers (${data.customers.length})...`);
    for (const cust of data.customers) {
      await prisma.customer.upsert({
        where: { id: cust.id },
        update: {},
        create: {
          id: cust.id,
          name: cust.name,
          phone: cust.phone,
          email: cust.email,
          address: cust.address,
          notes: cust.notes,
          createdAt: new Date(cust.createdAt),
          updatedAt: new Date(cust.updatedAt),
        },
      });
    }

    // 7. Orders
    console.log(`8. Syncing Orders (${data.orders.length})...`);
    for (const ord of data.orders) {
      await prisma.order.upsert({
        where: { id: ord.id },
        update: {},
        create: {
          id: ord.id,
          customerId: ord.customerId,
          status: ord.status,
          deliveryAddress: ord.deliveryAddress,
          city: ord.city,
          notes: ord.notes,
          codEnabled: ord.codEnabled,
          paymentMethod: ord.paymentMethod,
          paymentStatus: ord.paymentStatus,
          transactionRef: ord.transactionRef,
          receiptUrl: ord.receiptUrl,
          paymentDate: ord.paymentDate ? new Date(ord.paymentDate) : null,
          createdAt: new Date(ord.createdAt),
          updatedAt: new Date(ord.updatedAt),
        },
      });
    }

    // 8. Order Items
    console.log(`9. Syncing Order Items (${data.orderItems.length})...`);
    for (const item of data.orderItems) {
      await prisma.orderItem.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }

    // 9. Order Status History
    console.log(`10. Syncing Order Status History (${data.orderStatusHistories.length})...`);
    for (const hist of data.orderStatusHistories) {
      await prisma.orderStatusHistory.upsert({
        where: { id: hist.id },
        update: {},
        create: {
          id: hist.id,
          orderId: hist.orderId,
          status: hist.status,
          notes: hist.notes,
          createdAt: new Date(hist.createdAt),
        },
      });
    }

    // 10. PreBookings
    console.log(`11. Syncing PreBookings (${data.preBookings.length})...`);
    for (const pb of data.preBookings) {
      await prisma.preBooking.upsert({
        where: { id: pb.id },
        update: {},
        create: {
          id: pb.id,
          customerName: pb.customerName,
          phone: pb.phone,
          whatsapp: pb.whatsapp,
          email: pb.email,
          vehicleMake: pb.vehicleMake,
          vehicleModel: pb.vehicleModel,
          vehicleYear: pb.vehicleYear,
          partName: pb.partName,
          partNumber: pb.partNumber,
          quantity: pb.quantity || 1,
          preferredDate: pb.preferredDate,
          notes: pb.notes,
          status: pb.status || 'NEW',
          imageUrl: pb.imageUrl,
          createdAt: new Date(pb.createdAt),
          updatedAt: new Date(pb.updatedAt),
        },
      });
    }

    // 11. Customer Enquiries
    console.log(`12. Syncing Customer Enquiries (${data.customerEnquiries.length})...`);
    for (const enq of data.customerEnquiries) {
      await prisma.customerEnquiry.upsert({
        where: { id: enq.id },
        update: {},
        create: {
          id: enq.id,
          customerName: enq.customerName,
          phone: enq.phone,
          whatsapp: enq.whatsapp,
          partRequired: enq.partRequired,
          vehicle: enq.vehicle,
          message: enq.message,
          createdAt: new Date(enq.createdAt),
        },
      });
    }

    console.log('\n========================================================');
    console.log('🎉 ALL DATA TABLES SAFELY RESTORED & SYNCHRONIZED!');
    console.log('========================================================');

    const [adminCount, catCount, prodCount, ordCount] = await Promise.all([
      prisma.admin.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    console.log(`Verified Live Record Counts in Target Database:`);
    console.log(`  Admins:     ${adminCount}`);
    console.log(`  Categories: ${catCount}`);
    console.log(`  Products:   ${prodCount}`);
    console.log(`  Orders:     ${ordCount}`);
  } catch (error: any) {
    console.error('\n❌ RESTORATION FAILED:', error.message);
    if (error.code === 'P2021') {
      console.error('\n💡 HINT: The target database does not have the tables created yet.');
      console.error('Run: npx prisma db push');
      console.error('Then run this restoration script again.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportBackup() {
  console.log('--- Starting Local Database Data Backup ---');
  try {
    const backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const [
      admins,
      categories,
      products,
      productImages,
      customers,
      orders,
      orderItems,
      orderStatusHistories,
      siteSettings,
      preBookings,
      customerEnquiries,
    ] = await Promise.all([
      prisma.admin.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.productImage.findMany(),
      prisma.customer.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.orderStatusHistory.findMany(),
      prisma.siteSettings.findMany(),
      prisma.preBooking.findMany(),
      prisma.customerEnquiry.findMany(),
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      counts: {
        admins: admins.length,
        categories: categories.length,
        products: products.length,
        productImages: productImages.length,
        customers: customers.length,
        orders: orders.length,
        orderItems: orderItems.length,
        orderStatusHistories: orderStatusHistories.length,
        siteSettings: siteSettings.length,
        preBookings: preBookings.length,
        customerEnquiries: customerEnquiries.length,
      },
      data: {
        admins,
        categories,
        products,
        productImages,
        customers,
        orders,
        orderItems,
        orderStatusHistories,
        siteSettings,
        preBookings,
        customerEnquiries,
      },
    };

    const filePath = path.join(backupDir, 'local-data-backup.json');
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

    console.log(`✅ Backup successfully saved to: ${filePath}`);
    console.log('Record counts:', backupData.counts);
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportBackup();

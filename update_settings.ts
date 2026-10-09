import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        companyName: 'NG Motors (Pvt) Ltd',
        storeName: 'Automate Parts',
        address: '57, Kurunegala Road, Galewela, Sri Lanka',
        phone: '077 123 4567',
        whatsapp: '077 123 4567',
        email: 'info@ngmotors.com',
        bankTransferEnabled: true,
        codEnabled: true,
        bankName: 'Commercial Bank',
        bankAccountName: 'NG Motors Pvt Ltd',
        bankAccountNumber: '1000 0000 0000',
        bankBranch: 'Colombo 01',
        paymentInstructions: 'Please use your Order ID as the reference.'
      }
    });
  } else {
    settings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        bankTransferEnabled: true,
        bankName: 'Commercial Bank',
        bankAccountName: 'NG Motors Pvt Ltd',
        bankAccountNumber: '1000 0000 0000',
        bankBranch: 'Colombo 01'
      }
    });
  }
  console.log('Settings:', settings);
}
main().finally(() => prisma.$disconnect());

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Public & Admin: Get site settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      // Create defaults if not exists
      settings = await prisma.siteSettings.create({
        data: {
          companyName: 'NG Motors (Pvt) Ltd',
          storeName: 'Automate Parts',
          address: '57, Kurunegala Road, Galewela, Sri Lanka',
          phone: '+94777561007',
          whatsapp: '94777561007',
          email: '',
          codEnabled: true,
          lowStockThreshold: 5,
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Update site settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    let settings = await prisma.siteSettings.findFirst();

    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          companyName: data.companyName,
          storeName: data.storeName,
          address: data.address,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          businessHours: data.businessHours,
          codEnabled: data.codEnabled,
          bankTransferEnabled: data.bankTransferEnabled,
          bankName: data.bankName,
          bankAccountName: data.bankAccountName,
          bankAccountNumber: data.bankAccountNumber,
          bankBranch: data.bankBranch,
          paymentInstructions: data.paymentInstructions,
          lowStockThreshold: data.lowStockThreshold,
          footerContent: data.footerContent
        }
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          companyName: data.companyName,
          storeName: data.storeName,
          address: data.address,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          businessHours: data.businessHours,
          codEnabled: data.codEnabled,
          bankTransferEnabled: data.bankTransferEnabled,
          bankName: data.bankName,
          bankAccountName: data.bankAccountName,
          bankAccountNumber: data.bankAccountNumber,
          bankBranch: data.bankBranch,
          paymentInstructions: data.paymentInstructions,
          lowStockThreshold: data.lowStockThreshold,
          footerContent: data.footerContent
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const enquiry = await prisma.customerEnquiry.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        whatsapp: data.whatsapp,
        partRequired: data.partRequired,
        vehicle: data.vehicle,
        message: data.message
      }
    });
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
};

export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const enquiries = await prisma.customerEnquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

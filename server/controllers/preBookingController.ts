import { Request, Response } from 'express';
import { prisma } from '../db';

export const createPreBooking = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const preBooking = await prisma.preBooking.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        partName: data.partName,
        partNumber: data.partNumber,
        quantity: parseInt(data.quantity) || 1,
        preferredDate: data.preferredDate,
        notes: data.notes
      }
    });
    res.status(201).json(preBooking);
  } catch (error) {
    console.error('Error creating pre-booking:', error);
    res.status(500).json({ error: 'Failed to submit pre-booking' });
  }
};

export const getPreBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.preBooking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching pre-bookings:', error);
    res.status(500).json({ error: 'Failed to fetch pre-bookings' });
  }
};

export const updatePreBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await prisma.preBooking.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating pre-booking status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

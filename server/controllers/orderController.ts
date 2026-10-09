import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Public: Submit a new order enquiry
export const submitOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer, deliveryAddress, city, notes, paymentMethod, codEnabled, items } = req.body;

    if (!customer?.name || !customer?.phone || !deliveryAddress || !city || !items || !items.length) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 1. Find or create the customer by phone
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: customer.phone }
    });

    let customerId;
    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Optionally update name/email if they changed
      await prisma.customer.update({
        where: { id: customerId },
        data: { name: customer.name, email: customer.email, address: deliveryAddress }
      });
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: deliveryAddress
        }
      });
      customerId = newCustomer.id;
    }

    // fallback for backward compatibility
    const resolvedPaymentMethod = paymentMethod || (codEnabled ? 'COD' : 'BANK_TRANSFER');

    // 2. Create the Order and OrderItems within a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId,
          deliveryAddress,
          city,
          notes,
          codEnabled: resolvedPaymentMethod === 'COD',
          paymentMethod: resolvedPaymentMethod,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              notes: 'Order enquiry submitted by customer'
            }
          }
        },
        include: { items: true, customer: true }
      });

      return newOrder;
    });

    res.status(201).json({ message: 'Order submitted successfully', orderId: order.id });
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get all orders
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAYMENT_VERIFICATION', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const dataToUpdate: any = {};
      if (status) dataToUpdate.status = status;
      if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

      const updatedOrder = await tx.order.update({
        where: { id },
        data: dataToUpdate
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: updatedOrder.status,
          notes: notes || (paymentStatus ? `Payment status updated to ${paymentStatus}` : undefined)
        }
      });

      return updatedOrder;
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Public: Get order by ID (restricted data)
export const getPublicOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Omit sensitive customer data for public link
    res.json(order);
  } catch (error) {
    console.error('Error fetching public order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Public: Submit Payment Receipt
export const submitPaymentReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { transactionRef } = req.body;
    const file = req.file;

    if (!transactionRef || !file) {
      res.status(400).json({ error: 'Missing payment information or receipt file' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    const { supabase } = await import('../services/supabase');
    const { v4: uuidv4 } = await import('uuid');
    
    const sanitizeFileName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase();
    const fileName = `${id}/${uuidv4()}-${sanitizeFileName(file.originalname)}`;
    
    // Upload to private bucket 'payment-receipts'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      res.status(500).json({ error: 'Failed to upload receipt securely' });
      return;
    }

    // We store the internal path, not a public URL since it's private
    const receiptPath = uploadData.path;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          transactionRef,
          receiptUrl: receiptPath,
          paymentStatus: 'PAYMENT_SUBMITTED',
          status: 'PAYMENT_VERIFICATION',
          paymentDate: new Date()
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'PAYMENT_VERIFICATION',
          notes: `Customer submitted payment receipt with reference: ${transactionRef}`
        }
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error submitting payment receipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get signed URL for receipt
export const getOrderReceiptUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || !order.receiptUrl) {
      res.status(404).json({ error: 'Receipt not found' });
      return;
    }

    const { supabase } = await import('../services/supabase');
    
    // Generate signed URL valid for 5 minutes (300 seconds)
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(order.receiptUrl, 300);

    if (error || !data) {
      console.error('Error generating signed URL:', error);
      res.status(500).json({ error: 'Failed to generate receipt URL' });
      return;
    }

    res.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Error fetching receipt URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


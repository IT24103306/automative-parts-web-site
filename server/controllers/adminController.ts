import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const trimmedEmail = email.trim();
    const admin = await prisma.admin.findUnique({ where: { email: trimmedEmail } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// This endpoint initializes the first admin if none exist
export const setupInitialAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminCount = await prisma.admin.count();
    
    if (adminCount > 0) {
      res.status(400).json({ error: 'Admin already setup. Please login.' });
      return;
    }

    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    res.status(201).json({ 
      message: 'Initial admin created successfully',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    
    if (!admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    res.json({ admin });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminCredentials = async (req: any, res: Response): Promise<void> => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;

    if (!currentPassword || (!newEmail && !newPassword)) {
      res.status(400).json({ error: 'Current password and at least one field to update are required' });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Incorrect current password' });
      return;
    }

    const updateData: any = {};
    if (newEmail) updateData.email = newEmail;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    const updatedAdmin = await prisma.admin.update({
      where: { id: req.admin.id },
      data: updateData,
    });

    res.json({ message: 'Credentials updated successfully' });
  } catch (error: any) {
    console.error('Update credentials error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};


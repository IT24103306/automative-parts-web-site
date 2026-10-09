import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Invalid token format' });
      return;
    }

    const secret = process.env.JWT_SECRET!;
    
    try {
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      
      // Verify admin still exists
      const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
      if (!admin) {
        res.status(401).json({ error: 'Unauthorized: Admin no longer exists' });
        return;
      }

      req.admin = { id: admin.id, email: admin.email };
      next();
    } catch (err) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

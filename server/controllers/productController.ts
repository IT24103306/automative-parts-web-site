import { Request, Response } from 'express';
import { PrismaClient, Availability } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to determine availability based on stock, if not manually overridden
const calculateAvailability = (stockQuantity: number, threshold: number, manualStatus?: string): Availability => {
  if (manualStatus && ['COMING_SOON', 'SPECIAL_ORDER', 'OUT_OF_STOCK'].includes(manualStatus)) {
    return manualStatus as Availability;
  }
  if (stockQuantity <= 0) return Availability.OUT_OF_STOCK;
  if (stockQuantity <= threshold) return Availability.LOW_STOCK;
  return Availability.AVAILABLE;
};

// Public & Admin: Get all products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activeOnly, categoryId, search, featured, make, model, year, page = '1', limit = '12' } = req.query;
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    
    if (activeOnly === 'true') where.active = true;
    if (categoryId) where.categoryId = categoryId;
    if (featured === 'true') where.featured = true;
    
    if (make) where.vehicleMake = make as string;
    if (model) where.vehicleModel = model as string;
    if (year) where.vehicleYear = year as string;
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { partNumber: { contains: search as string } },
        { SKU: { contains: search as string } },
        { brand: { contains: search as string } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] }
        },
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);
    
    res.json({
      data: products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Public & Admin: Get single product
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] }
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Create product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    // Validate essential fields
    if (!data.name || !data.partNumber || !data.SKU || !data.brand || !data.categoryId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Determine availability status based on stock
    const stockQuantity = data.stockQuantity || 0;
    const lowStockThreshold = data.lowStockThreshold || 5;
    const availability = calculateAvailability(stockQuantity, lowStockThreshold, data.availability);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        partNumber: data.partNumber,
        SKU: data.SKU,
        brand: data.brand,
        categoryId: data.categoryId,
        description: data.description,
        specifications: data.specifications || {},
        compatibility: data.compatibility || {},
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        engine: data.engine,
        fuelType: data.fuelType,
        transmission: data.transmission,
        stockQuantity,
        lowStockThreshold,
        availability,
        featured: data.featured || false,
        active: data.active !== undefined ? data.active : true,
      },
      include: { category: true }
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Part Number or SKU already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const stockQuantity = data.stockQuantity !== undefined ? data.stockQuantity : existingProduct.stockQuantity;
    const lowStockThreshold = data.lowStockThreshold !== undefined ? data.lowStockThreshold : existingProduct.lowStockThreshold;
    const availability = calculateAvailability(stockQuantity, lowStockThreshold, data.availability);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        partNumber: data.partNumber,
        SKU: data.SKU,
        brand: data.brand,
        categoryId: data.categoryId,
        description: data.description,
        specifications: data.specifications,
        compatibility: data.compatibility,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        engine: data.engine,
        fuelType: data.fuelType,
        transmission: data.transmission,
        stockQuantity,
        lowStockThreshold,
        availability,
        featured: data.featured,
        active: data.active,
      },
      include: { category: true }
    });

    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Part Number or SKU already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Delete product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Note: orderItems relation might restrict deletion if orders exist. 
    // Prisma setup has no cascade on OrderItem -> Product.
    // If a product has orders, we shouldn't hard-delete it, just deactivate it.
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      res.status(400).json({ 
        error: 'Cannot delete product because it has associated orders. Please deactivate it instead.' 
      });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const BUCKET_NAME = 'product-images';

// Helper to sanitize file names
const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase();
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Prepare file for upload
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${productId}/${uuidv4()}-${sanitizeFileName(file.originalname)}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error details:', uploadError);
      res.status(500).json({ 
        error: 'Failed to upload image to storage', 
        details: uploadError.message || uploadError 
      });
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // Determine if this should be the primary image
    const existingImagesCount = await prisma.productImage.count({
      where: { productId }
    });

    // Save to database
    const productImage = await prisma.productImage.create({
      data: {
        productId,
        url: publicUrl,
        isPrimary: existingImagesCount === 0, // First image is primary
        order: existingImagesCount
      }
    });

    res.status(201).json(productImage);
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // Extract path from public URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/[productId]/[filename]
    const urlParts = image.url.split(`/${BUCKET_NAME}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      // Delete from Supabase
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        // Continue to delete from DB even if storage fails, to keep DB clean
      }
    }

    // Delete from database
    await prisma.productImage.delete({ where: { id } });

    // If it was primary, make another image primary if exists
    if (image.isPrimary) {
      const firstRemaining = await prisma.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { order: 'asc' }
      });

      if (firstRemaining) {
        await prisma.productImage.update({
          where: { id: firstRemaining.id },
          data: { isPrimary: true }
        });
      }
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setPrimaryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Remove primary status from all images for this product
      await tx.productImage.updateMany({
        where: { productId: image.productId },
        data: { isPrimary: false }
      });

      // Set primary status for selected image
      await tx.productImage.update({
        where: { id },
        data: { isPrimary: true }
      });
    });

    res.json({ message: 'Primary image updated' });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

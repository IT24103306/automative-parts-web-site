import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { prisma } from '../db';

const BUCKET_NAME = 'product-images';

// Helper to sanitize file names
const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase();
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      res.status(400).json({ error: 'Invalid file format. Please upload JPG, PNG, WEBP, or GIF images only.' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image file size exceeds maximum limit of 5MB.' });
      return;
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const cleanName = sanitizeFileName(file.originalname);
    const uniqueFileId = uuidv4();
    const fileName = `${productId}/${uniqueFileId}-${cleanName}`;

    let publicUrl = '';

    // Primary: Try Supabase Storage if available
    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      publicUrl = publicUrlData.publicUrl;
    } catch (storageErr) {
      console.warn('[Image Storage] Supabase upload failed or unavailable. Falling back to local disk storage:', storageErr);
      
      // Fallback: Local file persistence in public/uploads/${productId}
      const productUploadDir = path.resolve(process.cwd(), 'public', 'uploads', productId);
      if (!fs.existsSync(productUploadDir)) {
        fs.mkdirSync(productUploadDir, { recursive: true });
      }

      const localFileName = `${uniqueFileId}-${cleanName}`;
      const localFilePath = path.join(productUploadDir, localFileName);
      fs.writeFileSync(localFilePath, file.buffer);

      publicUrl = `/uploads/${productId}/${localFileName}`;
    }

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
    res.status(500).json({ error: 'Internal server error while saving product image' });
  }
};

export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // If it's a Supabase URL, attempt to delete from Supabase
    const urlParts = image.url.split(`/${BUCKET_NAME}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      try {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      } catch (e) {
        console.warn('Could not remove file from Supabase storage:', e);
      }
    } else if (image.url.startsWith('/uploads/')) {
      // If it's a local file, remove from disk
      const localRelPath = image.url.replace(/^\/uploads\//, '');
      const localAbsPath = path.resolve(process.cwd(), 'public', 'uploads', localRelPath);
      if (fs.existsSync(localAbsPath)) {
        try {
          fs.unlinkSync(localAbsPath);
        } catch (e) {
          console.warn('Could not remove local file:', e);
        }
      }
    }

    // Delete from database
    await prisma.productImage.delete({ where: { id } });

    // If it was primary, designate the first remaining image as primary
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
    const id = req.params.id as string;
    
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

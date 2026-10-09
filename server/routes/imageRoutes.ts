import { Router } from 'express';
import multer from 'multer';
import { uploadProductImage, deleteProductImage, setPrimaryImage } from '../controllers/imageController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Configure multer for memory storage (since we upload directly to Supabase buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Admin routes for image management
router.post('/products/:productId', authenticateAdmin, upload.single('image'), uploadProductImage);
router.delete('/:id', authenticateAdmin, deleteProductImage);
router.patch('/:id/primary', authenticateAdmin, setPrimaryImage);

export default router;

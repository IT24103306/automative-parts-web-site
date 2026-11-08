import { Router } from 'express';
import { submitOrder, getOrders, getOrderById, updateOrderStatus, getPublicOrder, submitPaymentReceipt, getOrderReceiptUrl } from '../controllers/orderController';
import { authenticateAdmin } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid receipt file type. Only JPG, PNG, WEBP, or PDF files are accepted.'));
    }
  }
});

// Public routes
router.post('/', submitOrder);
router.get('/track/:id', getPublicOrder);
router.post('/track/:id/payment', upload.single('receipt'), submitPaymentReceipt);

// Protected Admin routes
router.get('/', authenticateAdmin, getOrders);
router.get('/:id', authenticateAdmin, getOrderById);
router.get('/:id/receipt', authenticateAdmin, getOrderReceiptUrl);
router.patch('/:id/status', authenticateAdmin, updateOrderStatus);

export default router;

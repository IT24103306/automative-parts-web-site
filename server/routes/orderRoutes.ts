import { Router } from 'express';
import { submitOrder, getOrders, getOrderById, updateOrderStatus, getPublicOrder, submitPaymentReceipt, getOrderReceiptUrl } from '../controllers/orderController';
import { authenticateAdmin } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

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

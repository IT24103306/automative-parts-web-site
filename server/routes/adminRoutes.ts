import { Router } from 'express';
import { loginAdmin, setupInitialAdmin, getAdminProfile, updateAdminCredentials } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', loginAdmin);
router.post('/setup', setupInitialAdmin);

// Protected routes
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/credentials', authenticateAdmin, updateAdminCredentials);

export default router;

import { Router } from 'express';
import { loginAdmin, setupInitialAdmin, getAdminProfile, updateAdminCredentials, diagnoseAdmin } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', loginAdmin);
router.post('/setup', setupInitialAdmin);
router.get('/diagnose', diagnoseAdmin);

// Protected routes
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/credentials', authenticateAdmin, updateAdminCredentials);

export default router;

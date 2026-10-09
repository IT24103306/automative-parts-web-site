import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getSettings);

// Protected Admin routes
router.put('/', authenticateAdmin, updateSettings);

export default router;

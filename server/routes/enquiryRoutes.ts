import { Router } from 'express';
import { createEnquiry, getEnquiries } from '../controllers/enquiryController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

router.post('/', createEnquiry);
router.get('/', authenticateAdmin, getEnquiries);

export default router;

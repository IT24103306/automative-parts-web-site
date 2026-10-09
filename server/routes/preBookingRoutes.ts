import { Router } from 'express';
import { createPreBooking, getPreBookings, updatePreBookingStatus } from '../controllers/preBookingController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

router.post('/', createPreBooking);
router.get('/', authenticateAdmin, getPreBookings);
router.patch('/:id/status', authenticateAdmin, updatePreBookingStatus);

export default router;

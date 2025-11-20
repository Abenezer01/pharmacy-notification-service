import { Router } from 'express';
import { pharmacyController } from '../controllers/pharmacyController';

const router = Router();

// POST /api/v1/pharmacies/notify-nearby
router.post('/notify-nearby', pharmacyController.notifyNearby);

export default router;
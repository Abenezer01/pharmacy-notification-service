import { Router } from 'express';
import pharmacyRoutes from './pharmacy.routes';
import { ResponseUtil } from '../utils/response';
import { isFirebaseActive } from '../config/firebase';

const router = Router();

// Mount pharmacy routes
router.use('/pharmacies', pharmacyRoutes);

// Health check
router.get('/health', (req, res) => {
  ResponseUtil.sendSuccess(res, {
    status: 'OK',
    uptime: process.uptime(),
    firebaseConnected: isFirebaseActive()
  }, 'System Operational');
});

export default router;
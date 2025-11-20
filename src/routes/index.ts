import { Router } from 'express';
import pharmacyRoutes from './pharmacy.routes';
import { ResponseUtil } from '../utils/response';

const router = Router();

// Mount pharmacy routes
router.use('/pharmacies', pharmacyRoutes);

// Health check
router.get('/health', (req, res) => {
  ResponseUtil.sendSuccess(res, {
    status: 'OK',
    uptime: process.uptime()
  }, 'System Operational');
});

export default router;
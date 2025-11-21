import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { ResponseUtil } from './utils/response';

// Initialize Express app
const app = express();

// Middleware
app.use(helmet() as any); // Security headers
app.use(cors() as any);   // Enable CORS
app.use(morgan('dev') as any); // Request logging
app.use(express.json() as any); // Parse JSON bodies

// Root Route (Welcome & Documentation)
app.get('/', (req: any, res: any) => {
  ResponseUtil.sendSuccess(res, {
    service: 'Pharmacy Notification API',
    status: 'Active',
    version: '1.0.0',
    availableEndpoints: {
      healthCheck: 'GET /api/v1/health',
      notifyNearby: 'POST /api/v1/pharmacies/notify-nearby'
    }
  }, 'Welcome to the Pharmacy API Backend');
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req: any, res: any) => {
  ResponseUtil.sendError(res, 'Route not found', 404);
});

export default app;
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

// Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res) => {
  ResponseUtil.sendError(res, 'Route not found', 404);
});

export default app;
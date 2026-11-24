import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import { optionalAuth } from './middleware/authMiddleware.js';
import { apiLimiter, authLimiter, decoderLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';

import authRoutes from './routes/authRoutes.js';
import decodeRoutes from './routes/decodeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import docsRoutes from './routes/docsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (configured to allow inline styles/previews for developer dashboards)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  })
);

// Request Parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request Telemetry Logging
app.use(requestLogger);

// Authentication resolution (JWT or API Key)
app.use(optionalAuth);

// General Rate Limiter on all /api routes
app.use('/api', apiLimiter);

// Specific Rate Limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/decode', decoderLimiter, decodeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/docs', docsRoutes);

// Health & Telemetry Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AI DECODER REST API & DATABASE',
    version: '3.2.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()) + 's',
    memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
    aiEngine: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      mode:
        process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
          ? 'Live Cloud Provider'
          : 'Intelligent Heuristic Neural Simulator'
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error Caught]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`=======================================================`);
  console.log(` ⚡ AI DECODER Core Engine running on port ${PORT}`);
  console.log(` 🌐 Health Endpoint:      http://localhost:${PORT}/api/health`);
  console.log(` 📖 OpenAPI Documentation: http://localhost:${PORT}/api/docs`);
  console.log(` 🛡️  Security & Rate Limiters: ACTIVE`);
  console.log(`=======================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server.');
  server.close(() => console.log('HTTP server closed.'));
});

export default app;

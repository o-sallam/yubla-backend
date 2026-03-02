import cors from 'cors';
import express from 'express';
import apiRouter from './routes/api.js';
import v1Router from './routes/v1.js';
import { initDb } from './data/db.js';

const app = express();
const frontendOrigin = String(process.env.FRONTEND_ORIGIN || '').trim();
const allowedOrigins = frontendOrigin 
  ? frontendOrigin.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Allow all origins if FRONTEND_ORIGIN is not set or is '*'
      if (!frontendOrigin || frontendOrigin === '*') return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);
app.use('/api/v1', v1Router);

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

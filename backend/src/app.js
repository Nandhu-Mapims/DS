import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import dischargeRoutes from './routes/dischargeRoutes.js';
import { error } from './utils/response.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/discharge', dischargeRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK' }));

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Discharge Summary API</title></head>
      <body style="font-family: system-ui; max-width: 600px; margin: 2rem auto; padding: 1rem;">
        <h1>Discharge Summary Workflow – API</h1>
        <p>This is the backend API server. It does not serve the app UI.</p>
        <ul>
          <li><a href="/api/health">/api/health</a> – health check</li>
          <li><strong>Frontend:</strong> Open <a href="http://localhost:5173">http://localhost:5173</a> (or the port Vite shows) to use the app.</li>
        </ul>
      </body>
    </html>
  `);
});

app.use((req, res) => {
  return error(res, 'Not found', 404);
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({
    success: false,
    data: undefined,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

export default app;

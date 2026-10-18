import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { handleAdvisoryGeneration } from './api/advisoryHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Healthcheck endpoint for Cloud Run
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgriShield AI Server',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Agricultural Advisory API endpoint
app.post('/api/advisory', async (req, res) => {
  try {
    const advisory = await handleAdvisoryGeneration(req.body);
    res.json(advisory);
  } catch (err: unknown) {
    console.error('Server error handling /api/advisory:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ error: message });
  }
});

// Weather endpoint backed by server-side weatherProvider
app.get('/api/weather', async (req, res) => {
  try {
    const state = (req.query.state as string) || 'Tamil Nadu';
    const district = (req.query.district as string) || 'Madurai';
    const lat = parseFloat((req.query.lat as string) || '9.9252');
    const lng = parseFloat((req.query.lng as string) || '78.1198');

    const { getDistrictWeather } = await import('./api/weatherProvider');
    const result = await getDistrictWeather({ state, district, lat, lng });
    res.json(result);
  } catch (err: unknown) {
    console.error('Server error handling /api/weather:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ error: message });
  }
});

// Serve frontend static files
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AgriShield AI server running on port ${PORT}`);
});

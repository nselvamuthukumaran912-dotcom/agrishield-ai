import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import dotenv from 'dotenv';
dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-advisory-api',
    configureServer(server) {
      server.middlewares.use('/api/advisory', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body || '{}');
            const { handleAdvisoryGeneration } = await import('./api/advisoryHandler.js');
            const advisory = await handleAdvisoryGeneration(parsedBody);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(advisory));
          } catch (err: unknown) {
            console.error('API Error in /api/advisory:', err);
            const message = err instanceof Error ? err.message : 'Internal Server Error';
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: message }));
          }
        });
      });

      server.middlewares.use('/api/weather', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const state = url.searchParams.get('state') || 'Tamil Nadu';
          const district = url.searchParams.get('district') || 'Madurai';
          const lat = parseFloat(url.searchParams.get('lat') || '9.9252');
          const lng = parseFloat(url.searchParams.get('lng') || '78.1198');

          const { getDistrictWeather } = await import('./api/weatherProvider.js');
          const result = await getDistrictWeather({ state, district, lat, lng });

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: unknown) {
          console.error('API Error in /api/weather:', err);
          const message = err instanceof Error ? err.message : 'Internal Server Error';
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

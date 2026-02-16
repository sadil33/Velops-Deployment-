import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;
const BACKEND_URL = process.env.BACKEND_URL || 'https://velops-backend.onrender.com';

// Proxy /api/* requests to the backend (server-to-server, bypasses corporate firewall)
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${BACKEND_URL}${req.url}`);
    },
    onError: (err, req, res) => {
        console.error(`[Proxy Error] ${req.method} ${req.url}:`, err.message);
        res.status(502).json({ error: 'Proxy error', details: err.message });
    }
}));

// Serve static files from the Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: all other routes serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
    console.log(`API proxy target: ${BACKEND_URL}`);
});

import express from 'express';

const entry = express();

// Isolated diagnostic endpoint
entry.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    nodeVersion: process.version
  });
});

// For now, return a 503 for anything else to avoid loading the broken app
entry.all('(.*)', (req, res) => {
  res.status(503).json({ error: 'App loading is temporarily disabled for diagnostics' });
});

export default entry;

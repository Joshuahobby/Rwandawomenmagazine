import express from 'express';
import app from '../server/app';

const entry = express();

// Diagnostic endpoint
entry.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL
  });
});

// Proxy everything else to the main app
entry.all('(.*)', (req, res) => {
  return app(req, res);
});

export default entry;

const express = require('express');
const entry = express();

entry.get('/api/health', (req, res) => {
  res.send('JS Health check reachable: ' + new Date().toISOString());
});

entry.all('(.*)', (req, res) => {
  res.status(503).send('Diagnostic mode JS: App code not loaded.');
});

module.exports = entry;

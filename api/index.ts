const express = require('express');
const entry = express();

entry.get('/api/health', (req, res) => {
  try {
    res.send('Health check reachable: ' + new Date().toISOString() + ' Node: ' + process.version);
  } catch (e) {
    res.status(500).send('Inner crash: ' + e.message);
  }
});

entry.all('(.*)', (req, res) => {
  res.status(503).send('Diagnostic mode: App code not loaded.');
});

module.exports = entry;

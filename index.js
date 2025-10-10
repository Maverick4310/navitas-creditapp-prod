/**
 * index.js
 * --------------------------------------------------------
 * Entry point for Navitas Credit App Proxy
 * Use Render env vars to distinguish sandbox vs production.
 * --------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { forwardToSalesforce } = require('./src/services/salesforceProxy');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Health check
app.get('/ping', (req, res) => {
  res.status(200).send(`Proxy is up in ${process.env.MODE || 'unknown'} mode`);
});

// Main forwarder
app.post('/creditapp', forwardToSalesforce);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Navitas Credit App Proxy (${process.env.MODE}) running on port ${PORT}`);
});

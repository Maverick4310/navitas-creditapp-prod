/**
 * salesforceProxy.js
 * --------------------------------------------------------
 * Forwards partner JSON payloads to Salesforce and returns
 * Salesforce's response verbatim.
 *
 * Required environment variables (set in Render):
 *   - TARGET_SF_URL : Salesforce REST endpoint (prod)
 *   - MODE          : 'production' (for logs)
 * --------------------------------------------------------
 */

const axios = require('axios');

async function forwardToSalesforce(req, res) {
  const targetUrl = process.env.TARGET_SF_URL;

  if (!targetUrl) {
    return res.status(500).json({ error: 'Missing TARGET_SF_URL environment variable.' });
  }

  try {
    const started = Date.now();

    const sfResponse = await axios.post(targetUrl, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 25000
    });

    const elapsed = ((Date.now() - started) / 1000).toFixed(2);
    console.log(
      `[${new Date().toISOString()}] [${process.env.MODE}] Forwarded to SF (${elapsed}s) → Status ${sfResponse.status}`
    );

    // Pass Salesforce response through unchanged
    return res.status(sfResponse.status).send(sfResponse.data);

  } catch (error) {
    console.error(`[ERROR ${new Date().toISOString()}] Salesforce proxy failed: ${error.message}`);

    if (error.response) {
      // SF returned a non-2xx response
      return res.status(error.response.status).json({
        message: 'Salesforce responded with an error',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // No response from SF (timeout/network)
      return res.status(504).json({ message: 'No response from Salesforce endpoint (timeout or network issue).' });
    } else {
      // Other internal error
      return res.status(500).json({ message: 'Internal proxy error.', detail: error.message });
    }
  }
}

module.exports = { forwardToSalesforce };

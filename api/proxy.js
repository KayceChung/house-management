/**
 * Vercel Serverless Function - API Proxy
 * Proxies requests to Google Apps Script backend
 * This solves CORS issues by acting as trusted intermediary
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    // Google Apps Script endpoint
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwG9YyGVckprdQeP3GFZFNCO1ZcYER_TasskXCUjG2IuQizqmlZSpKfS80UlBXAHm4y3g/exec';

    // Build form-urlencoded body
    const formData = new URLSearchParams();
    formData.append('action', action);
    formData.append('params', JSON.stringify(params || {}));

    // Call Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Google Apps Script error: ${response.status}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: `Proxy error: ${error.message}`
    });
  }
}

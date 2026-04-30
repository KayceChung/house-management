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
    console.log('📡 [Proxy] Incoming request method:', req.method);
    console.log('📡 [Proxy] Content-Type:', req.headers['content-type']);
    console.log('📡 [Proxy] Raw body type:', typeof req.body);
    console.log('📡 [Proxy] Raw body preview:', req.body?.toString().substring(0, 200));

    // Parse form-urlencoded body from client
    let action, params;
    
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      // Parse form-urlencoded data manually (Vercel doesn't auto-parse)
      const bodyString = typeof req.body === 'string' ? req.body : req.body?.toString() || '';
      console.log('📡 [Proxy] Parsing form-urlencoded:', bodyString);
      
      const querystring = require('querystring');
      const parsed = querystring.parse(bodyString);
      
      console.log('📡 [Proxy] Parsed data:', { action: parsed.action, paramsLength: parsed.params?.length });
      
      action = parsed.action;
      params = parsed.params ? JSON.parse(parsed.params) : {};
    } else if (req.headers['content-type']?.includes('application/json')) {
      // Parse JSON body
      const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const body = JSON.parse(bodyString);
      action = body.action;
      params = body.params;
    } else {
      return res.status(400).json({ 
        error: 'Unsupported Content-Type',
        received: req.headers['content-type']
      });
    }

    console.log('📡 [Proxy] Extracted action:', action, 'Params keys:', Object.keys(params || {}));

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    // Google Apps Script endpoint
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyt_N5TNEiCZ5VAxaP0wegFOWsEg46ePhrScpifqFjAhUnd7fR_GqVlx3vl--lYBBDy/exec';

    // Build form-urlencoded body to forward to Google Apps Script
    const formData = new URLSearchParams();
    formData.append('action', action);
    formData.append('params', JSON.stringify(params || {}));

    console.log('📡 [Proxy] Forwarding to GAS:', { action, paramKeys: Object.keys(params) });

    // Call Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const responseText = await response.text();
    console.log('📡 [Proxy] GAS Response status:', response.status);
    console.log('📡 [Proxy] GAS Response preview:', responseText.substring(0, 200));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Google Apps Script error: ${response.status}`,
        details: responseText.substring(0, 500)
      });
    }

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error('📡 [Proxy] Failed to parse GAS response:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Invalid JSON response from Google Apps Script'
      });
    }

  } catch (error) {
    console.error('❌ [Proxy] Error:', error.message);
    console.error('❌ [Proxy] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: `Proxy error: ${error.message}`
    });
  }
}

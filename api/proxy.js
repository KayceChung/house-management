/**
 * Vercel Serverless Function - API Proxy
 * Proxies requests to Google Apps Script backend
 * This solves CORS issues by acting as trusted intermediary
 */

import { parse } from 'querystring';

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
    console.log('📡 [Proxy] Is Buffer?:', Buffer.isBuffer(req.body));
    
    // IMPORTANT: In Vercel, we need to handle the raw stream or Buffer
    // req.body is NOT automatically parsed
    let bodyString = '';
    
    if (typeof req.body === 'string') {
      bodyString = req.body;
      console.log('📡 [Proxy] Body is string');
    } else if (Buffer.isBuffer(req.body)) {
      bodyString = req.body.toString('utf-8');
      console.log('📡 [Proxy] Body is Buffer, converted to string');
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Try to get the raw body using different methods
      if (req.rawBody) {
        bodyString = typeof req.rawBody === 'string' ? req.rawBody : req.rawBody.toString('utf-8');
        console.log('📡 [Proxy] Using req.rawBody');
      } else {
        // Last resort: try to read from stream
        bodyString = await readStream(req);
        console.log('📡 [Proxy] Read from stream');
      }
    }
    
    console.log('📡 [Proxy] Final bodyString length:', bodyString.length);
    console.log('📡 [Proxy] Raw body preview:', bodyString.substring(0, 300));

    // Parse form-urlencoded body from client
    let action, params;
    
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      // Parse form-urlencoded data manually (Vercel doesn't auto-parse)
      console.log('📡 [Proxy] Detected form-urlencoded');
      
      if (!bodyString || bodyString.length === 0) {
        console.error('❌ [Proxy] ERROR: bodyString is empty!');
        return res.status(400).json({ error: 'Empty request body' });
      }
      
      const parsed = parse(bodyString);
      
      console.log('📡 [Proxy] Parsed keys:', Object.keys(parsed));
      console.log('📡 [Proxy] Parsed action:', parsed.action);
      console.log('📡 [Proxy] Parsed params length:', parsed.params?.length);
      
      action = parsed.action;
      params = parsed.params ? JSON.parse(parsed.params) : {};
    } else if (req.headers['content-type']?.includes('application/json')) {
      // Parse JSON body
      const body = typeof bodyString === 'string' ? JSON.parse(bodyString) : bodyString;
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
      console.error('❌ [Proxy] ERROR: Missing action parameter');
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
    console.log('📡 [Proxy] GAS Response full text:', responseText);
    console.log('📡 [Proxy] Response length:', responseText.length);
    console.log('📡 [Proxy] Response first 500 chars:', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('❌ [Proxy] Non-200 response from GAS');
      return res.status(response.status).json({
        success: false,
        message: `Google Apps Script error: ${response.status}`,
        details: responseText.substring(0, 500)
      });
    }

    try {
      if (!responseText || responseText.length === 0) {
        console.error('❌ [Proxy] ERROR: GAS returned empty response');
        return res.status(500).json({
          success: false,
          message: 'Google Apps Script returned empty response'
        });
      }
      
      const data = JSON.parse(responseText);
      console.log('✅ [Proxy] Successfully parsed GAS response:', data);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error('❌ [Proxy] Failed to parse GAS response:', parseError.message);
      console.error('❌ [Proxy] Raw response was:', responseText.substring(0, 1000));
      return res.status(500).json({
        success: false,
        message: 'Invalid JSON response from Google Apps Script',
        rawResponse: responseText.substring(0, 300),
        error: parseError.message
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

// Helper function to read request stream
async function readStream(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk.toString('utf-8');
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

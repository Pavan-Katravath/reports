/**
 * Simple test endpoint to debug serverless function issues
 */

export default async function handler(req, res) {
  console.log('Test function started:', new Date().toISOString());
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test basic functionality
    const testData = {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      method: req.method,
      headers: req.headers,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
      puppeteerAvailable: false
    };

    // Test if Puppeteer can be imported
    try {
      const puppeteer = await import('puppeteer');
      testData.puppeteerAvailable = true;
      testData.puppeteerVersion = puppeteer.default.version || 'unknown';
    } catch (puppeteerError) {
      testData.puppeteerError = puppeteerError.message;
    }

    res.status(200).json(testData);
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: 'Test endpoint failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

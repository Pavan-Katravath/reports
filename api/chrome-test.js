/**
 * Test different Chrome paths in Vercel
 */

export default async function handler(req, res) {
  console.log('Chrome test function started:', new Date().toISOString());

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
    const puppeteer = await import('puppeteer');
    
    // Test different Chrome paths
    const chromePaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/opt/google/chrome/chrome',
      '/usr/local/bin/chrome',
      undefined // Let Puppeteer find it
    ];

    const results = [];

    for (const path of chromePaths) {
      try {
        console.log(`Testing Chrome path: ${path || 'auto-detect'}`);
        
        const browser = await puppeteer.default.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: path,
          timeout: 10000
        });

        const page = await browser.newPage();
        await page.setContent('<h1>Test</h1>');
        await browser.close();

        results.push({
          path: path || 'auto-detect',
          status: 'success',
          message: 'Chrome found and working'
        });
        
        console.log(`✅ Chrome path ${path || 'auto-detect'} works!`);
        break; // Stop testing once we find a working path
        
      } catch (error) {
        results.push({
          path: path || 'auto-detect',
          status: 'failed',
          message: error.message
        });
        console.log(`❌ Chrome path ${path || 'auto-detect'} failed: ${error.message}`);
      }
    }

    res.status(200).json({
      message: 'Chrome path test completed',
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chrome test error:', error);
    res.status(500).json({
      error: 'Chrome test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

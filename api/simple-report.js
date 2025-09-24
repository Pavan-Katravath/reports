/**
 * Simplified report endpoint for testing
 */

export default async function handler(req, res) {
  console.log('Simple report function started:', new Date().toISOString());

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
    console.log('Importing Puppeteer...');
    const puppeteer = await import('puppeteer');
    
    console.log('Launching browser...');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    console.log('Creating new page...');
    const page = await browser.newPage();

    console.log('Setting content...');
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Simple Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <h1>Simple Test Report</h1>
        <p>Generated at: ${new Date().toISOString()}</p>
        <p>This is a simple PDF test.</p>
      </body>
      </html>
    `);

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    console.log('Closing browser...');
    await browser.close();

    console.log('PDF generated successfully:', pdfBuffer.length, 'bytes');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="simple-report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Simple report error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Simple report generation failed',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

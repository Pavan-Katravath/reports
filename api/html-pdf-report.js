/**
 * HTML to PDF conversion using html-pdf-node
 * More reliable than Puppeteer for serverless
 */

import htmlPdf from 'html-pdf-node';

export default async function handler(req, res) {
  console.log('HTML-PDF report function started:', new Date().toISOString());

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
    console.log('Preparing HTML content...');
    
    // Get report data
    const reportData = req.method === 'POST' ? req.body : {
      call_no: 'TEST-001',
      customer_name: 'Test Customer',
      site_name: 'Test Site',
      engineer_name: 'Test Engineer',
      report_date: new Date().toISOString().split('T')[0],
      work_performed: 'Test maintenance work performed',
      recommendations: 'Test recommendations for future maintenance',
      product_group: 'dpg'
    };

    // Generate HTML content
    const htmlContent = generateReportHTML(reportData);
    
    console.log('Converting HTML to PDF...');
    
    // PDF options
    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    // Convert HTML to PDF
    const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, options);
    
    console.log('PDF generated successfully:', pdfBuffer.length, 'bytes');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="notification-report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Send PDF
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('HTML-PDF report error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'HTML-PDF report generation failed',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

function generateReportHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Notification Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 24px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section h2 {
                color: #007bff;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                font-size: 16px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }
            .info-item {
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            .info-label {
                font-weight: bold;
                color: #495057;
                font-size: 12px;
            }
            .info-value {
                color: #212529;
                font-size: 14px;
                margin-top: 5px;
            }
            .content-section {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 15px;
            }
            .list-item {
                margin-bottom: 8px;
                padding-left: 15px;
                position: relative;
            }
            .list-item:before {
                content: "•";
                color: #007bff;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Field Service Report</h1>
            <p>${data.product_group?.toUpperCase() || 'DPG'} Notification Report</p>
        </div>

        <div class="section">
            <h2>Report Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Call Number</div>
                    <div class="info-value">${data.call_no || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Customer Name</div>
                    <div class="info-value">${data.customer_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Site Name</div>
                    <div class="info-value">${data.site_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Engineer</div>
                    <div class="info-value">${data.engineer_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Report Date</div>
                    <div class="info-value">${data.report_date || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Product Group</div>
                    <div class="info-value">${data.product_group?.toUpperCase() || 'DPG'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Work Performed</h2>
            <div class="content-section">
                <p>${data.work_performed || 'No work details provided'}</p>
            </div>
        </div>

        <div class="section">
            <h2>Recommendations</h2>
            <div class="content-section">
                <p>${data.recommendations || 'No recommendations provided'}</p>
            </div>
        </div>

        ${data.formdata?.safety_observations ? `
        <div class="section">
            <h2>Safety Observations</h2>
            <div class="content-section">
                ${data.formdata.safety_observations.map(obs => 
                    `<div class="list-item">${obs}</div>`
                ).join('')}
            </div>
        </div>
        ` : ''}

        ${data.formdata?.work_performed ? `
        <div class="section">
            <h2>Detailed Work Performed</h2>
            <div class="content-section">
                ${data.formdata.work_performed.map(work => 
                    `<div class="list-item">${work}</div>`
                ).join('')}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>This report was generated automatically by the notification service.</p>
        </div>
    </body>
    </html>
  `;
}

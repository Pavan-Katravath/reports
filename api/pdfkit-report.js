/**
 * PDFKit-based report generation (No browser needed!)
 * Much more reliable for serverless environments
 */

import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  console.log('PDFKit report function started:', new Date().toISOString());

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
    console.log('Creating PDF document...');
    
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Collect PDF data
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    const pdfPromise = new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });

    // Add content to PDF
    console.log('Adding content to PDF...');
    
    // Header
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Notification Report', { align: 'center' });
    
    doc.moveDown(1);
    
    // Report details
    const reportData = req.method === 'POST' ? req.body : {
      call_no: 'TEST-001',
      customer_name: 'Test Customer',
      site_name: 'Test Site',
      engineer_name: 'Test Engineer',
      report_date: new Date().toISOString().split('T')[0],
      work_performed: 'Test maintenance work performed',
      recommendations: 'Test recommendations for future maintenance'
    };

    // Report information
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Report Information', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Call Number: ${reportData.call_no || 'N/A'}`)
       .text(`Customer: ${reportData.customer_name || 'N/A'}`)
       .text(`Site: ${reportData.site_name || 'N/A'}`)
       .text(`Engineer: ${reportData.engineer_name || 'N/A'}`)
       .text(`Date: ${reportData.report_date || 'N/A'}`);
    
    doc.moveDown(1);
    
    // Work performed section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Work Performed', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(reportData.work_performed || 'No work details provided');
    
    doc.moveDown(1);
    
    // Recommendations section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Recommendations', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(reportData.recommendations || 'No recommendations provided');
    
    doc.moveDown(1);
    
    // Safety observations (if provided)
    if (reportData.formdata && reportData.formdata.safety_observations) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Safety Observations', { underline: true });
      
      doc.moveDown(0.5);
      
      doc.fontSize(12)
         .font('Helvetica');
      
      reportData.formdata.safety_observations.forEach(observation => {
        doc.text(`• ${observation}`);
      });
      
      doc.moveDown(1);
    }
    
    // Footer
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    
    // Finalize PDF
    console.log('Finalizing PDF...');
    doc.end();
    
    // Wait for PDF to be generated
    const pdfBuffer = await pdfPromise;
    
    console.log('PDF generated successfully:', pdfBuffer.length, 'bytes');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="notification-report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Send PDF
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('PDFKit report error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'PDFKit report generation failed',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

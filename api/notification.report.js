import { reportGenerationHelper } from '../helpers/reportGenerationHelper.js';

/**
 * Vercel Serverless Function for Notification Report Generation
 * Handles PDF generation and returns downloadable file
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET and POST methods are supported'
    });
    return;
  }

  try {
    let reportData;
    let filename = 'notification-report.pdf';

    if (req.method === 'POST') {
      // Handle POST request with custom data
      const { data, filename: customFilename } = req.body;
      
      if (!data) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Report data is required in request body'
        });
        return;
      }

      reportData = data;
      if (customFilename) {
        filename = customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`;
      }
    } else {
      // Handle GET request - generate sample report
      reportData = {
        title: 'Sample Notification Report',
        timestamp: new Date().toISOString(),
        summary: {
          total: 15,
          unread: 3,
          urgent: 2,
          resolved: 10
        },
        notifications: [
          {
            type: 'Alert',
            message: 'System maintenance scheduled for tonight at 2 AM',
            priority: 'High',
            status: 'Active',
            source: 'System Monitor',
            user: 'admin',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            type: 'Warning',
            message: 'Disk space usage exceeded 85% on server-01',
            priority: 'Medium',
            status: 'Active',
            source: 'Server Monitor',
            user: 'ops-team',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            type: 'Info',
            message: 'New user registration: john.doe@example.com',
            priority: 'Low',
            status: 'Resolved',
            source: 'User Management',
            user: 'system',
            timestamp: new Date(Date.now() - 10800000).toISOString()
          }
        ],
        metadata: {
          generatedBy: 'notification-report-service',
          version: '1.0.0',
          environment: 'production'
        }
      };
    }

    // Generate PDF
    console.log('Generating notification report...');
    const pdfBuffer = await reportGenerationHelper.generateReport(reportData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF buffer
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error generating notification report:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate notification report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Clean up browser instance
    try {
      await reportGenerationHelper.closeBrowser();
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

// Export for Vercel
export const config = {
  api: {
    responseLimit: '10mb',
  },
};
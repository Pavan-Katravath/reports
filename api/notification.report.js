import { reportGenerationHelper } from '../helpers/reportGenerationHelper.js';

/**
 * Vercel Serverless Function for Notification Report Generation
 * Handles PDF generation and returns downloadable file
 * Compatible with collab project's notification.report API
 */

export default async function handler(req, res) {
  console.log('Function started:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-Auth-Token');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET and POST methods are supported'
    });
    return;
  }

  try {
    console.log('Starting report generation...');
    let reportData;
    let filename = 'notification-report.pdf';
    let productGroup = 'dpg'; // Default to DPG

    if (req.method === 'POST') {
      // Handle POST request with custom data
      const { 
        data, 
        filename: customFilename, 
        product_group,
        call_no,
        params,
        dontSentEmail = false,
        engineerSignature,
        managerSignature,
        formdata
      } = req.body;
      
      if (!data && !call_no) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Report data or call_no is required in request body'
        });
        return;
      }

      // Set product group
      if (product_group) {
        productGroup = product_group.toLowerCase();
      }

      // Set filename
      if (customFilename) {
        filename = customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`;
      } else if (call_no) {
        filename = `${call_no}.pdf`;
      }

      // Prepare report data
      if (data) {
        reportData = data;
      } else {
        // Generate report data from collab-style parameters
        reportData = {
          param: {
            call_no: call_no || 'SAMPLE-001',
            product_group: productGroup,
            params: params ? JSON.stringify(params) : undefined,
            engineerSignature: engineerSignature || '',
            managerSignature: managerSignature || '',
            dontSentEmail: dontSentEmail
          },
          paramObj: params || {},
          formdata: formdata || {},
          room: {
            name: call_no ? call_no.toLowerCase() : 'sample',
            customFields: {
              engineerSignature: engineerSignature || '',
              managerSignature: managerSignature || ''
            }
          },
          logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAD8CAYAAADkDI70AAABgWlDQ1BzUkdCIElFQzYxOTY2LTIuMQAAKJF1kc8rw2Ecx18bmpimOFAOS+NkmpG4OGwxCoeZMly2736pbb59v5OWq3JVlLj4deAv4KqclSJScpQzcWF9fb7bakv2eXo+z+t5P5/Pp+f5PGANpZWMXu+BTDanBQM+50J40Wl7xUInNkYYiii6OjM3EaKmfT1ItNid26xVO+5fa47FdQUsjcJjiqrlhCeFp9dzqsm7wu1KKhITPhfu0+SCwvemHi3xm8nJEv+YrIWCfrC2CjuTVRytYiWlZYTl5bgy6TWlfB/zJfZ4dn5O1m6ZXegECeDDyRTj+BlmgFHxw7jx0i87auR7ivmzrEquIl4lj8YKSVLk6BN1TarHZU2IHpeRJm/2/29f9cSgt1Td7oOGF8P46AHbDhS2DeP72DAKJ1D3DFfZSv7qEYx8ir5d0VyH4NiEi+uKFt2Dyy3oeFIjWqQo1cm0JhLwfgYtYWi7haalUs/K55w+QmhDvuoG9g+gV+Idy7/KAmgT1d6GTAAAAAlwSFlzAAALEwAACxMBAJqcGAAAIABJREFUeJzt3XeYJGXV/vHvBmCJkgQFQQGxERATisALSFwWOCSXLIgioCg/wABmRMH4vhgwgzAsUWBJhxyWaEBMmNA2K0El57Th90fVsLPDzGx3T9Vzqqrvz3Xt5bo7U+eGZbv71PPUcyYgjWJmSwOrAS8b9mN5YAlg8fzHSD9fDHgGeBJ4asiPJ4f9/AHgrmE//uXuj6f4ZxQREREREWmiCdEBpHtmtgywAfDa/H/XYH4jvnRgtEeZ37D/Ffg1cAfwazXvIiIiIiIiY1ODXmFmNgFYk6wRH+yxAfAK6vVnN4+sYb9j6A93/3tkKBERERERkSqpU5PXeHlDvj6wVf5jc2DZ0FDluh+4CZgFzHL3PwTs',
          tableHTML: '',
          returnedEls: [],
          issuedEls: []
        };
      }
    } else {
      // Handle GET request - generate sample report
      reportData = {
        param: {
          call_no: 'SAMPLE-001',
          product_group: 'dpg',
          params: JSON.stringify({
            customer_name: 'Sample Customer',
            site_name: 'Sample Site',
            engineer_name: 'John Doe',
            report_date: new Date().toISOString().split('T')[0],
            work_performed: 'Sample maintenance work performed',
            recommendations: 'Sample recommendations for future maintenance'
          }),
          engineerSignature: '',
          managerSignature: '',
          dontSentEmail: true
        },
        paramObj: {
          customer_name: 'Sample Customer',
          site_name: 'Sample Site',
          engineer_name: 'John Doe',
          report_date: new Date().toISOString().split('T')[0],
          work_performed: 'Sample maintenance work performed',
          recommendations: 'Sample recommendations for future maintenance'
        },
        formdata: {
          safety_observations: [
            'All safety protocols were followed',
            'Personal protective equipment was used',
            'Work area was properly secured'
          ],
          work_performed: [
            'System inspection completed',
            'Preventive maintenance performed',
            'Documentation updated'
          ],
          recommendations: [
            'Schedule next maintenance in 6 months',
            'Monitor system performance',
            'Update maintenance procedures'
          ]
        },
        room: {
          name: 'sample',
          customFields: {
            engineerSignature: '',
            managerSignature: ''
          }
        },
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAD8CAYAAADkDI70AAABgWlDQ1BzUkdCIElFQzYxOTY2LTIuMQAAKJF1kc8rw2Ecx18bmpimOFAOS+NkmpG4OGwxCoeZMly2736pbb59v5OWq3JVlLj4deAv4KqclSJScpQzcWF9fb7bakv2eXo+z+t5P5/Pp+f5PGANpZWMXu+BTDanBQM+50J40Wl7xUInNkYYiii6OjM3EaKmfT1ItNid26xVO+5fa47FdQUsjcJjiqrlhCeFp9dzqsm7wu1KKhITPhfu0+SCwvemHi3xm8nJEv+YrIWCfrC2CjuTVRytYiWlZYTl5bgy6TWlfB/zJfZ4dn5O1m6ZXegECeDDyRTj+BlmgFHxw7jx0i87auR7ivmzrEquIl4lj8YKSVLk6BN1TarHZU2IHpeRJm/2/29f9cSgt1Td7oOGF8P46AHbDhS2DeP72DAKJ1D3DFfZSv7qEYx8ir5d0VyH4NiEi+uKFt2Dyy3oeFIjWqQo1cm0JhLwfgYtYWi7haalUs/K55w+QmhDvuoG9g+gV+Idy7/KAmgT1d6GTAAAAAlwSFlzAAALEwAACxMBAJqcGAAAIABJREFUeJzt3XeYJGXV/vHvBmCJkgQFQQGxERATisALSFwWOCSXLIgioCg/wABmRMH4vhgwgzAsUWBJhxyWaEBMmNA2K0El57Th90fVsLPDzGx3T9Vzqqrvz3Xt5bo7U+eGZbv71PPUcyYgjWJmSwOrAS8b9mN5YAlg8fzHSD9fDHgGeBJ4asiPJ4f9/AHgrmE//uXuj6f4ZxQREREREWmiCdEBpHtmtgywAfDa/H/XYH4jvnRgtEeZ37D/Ffg1cAfwazXvIiIiIiIiY1ODXmFmNgFYk6wRH+yxAfAK6vVnN4+sYb9j6A93/3tkKBERERERkSqpU5PXeHlDvj6wVf5jc2DZ0FDluh+4CZgFzHL3PwTs',
        tableHTML: '',
        returnedEls: [],
        issuedEls: []
      };
    }

    // Generate PDF based on product group
    console.log(`Generating ${productGroup} notification report...`);
    let pdfBuffer;

    switch (productGroup.toLowerCase()) {
      case 'dpg':
        pdfBuffer = await reportGenerationHelper.generateDPGReport(reportData);
        break;
      case 'air':
      case 'power':
        pdfBuffer = await reportGenerationHelper.generateThermalOrPowerReport(reportData);
        break;
      case 'dcps':
        pdfBuffer = await reportGenerationHelper.generateDCPSReport(reportData);
        break;
      default:
        // Default to DPG if unknown product group
        pdfBuffer = await reportGenerationHelper.generateDPGReport(reportData);
        break;
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF buffer
    res.status(200).send(pdfBuffer);

    console.log(`PDF content generated successfully for ${productGroup} type (${pdfBuffer.length} bytes)`);

  } catch (error) {
    console.error('Error generating notification report:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate notification report',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Clean up browser instance
    try {
      console.log('Cleaning up browser...');
      await reportGenerationHelper.closeBrowser();
      console.log('Browser cleanup completed');
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
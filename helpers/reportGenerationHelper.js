import puppeteer from 'puppeteer';
import { generateDPGReport, generateThermalOrPowerReport, generateDCPSReport } from '../templates/reportTemplate.js';

/**
 * PDF Generation Helper using Puppeteer
 * Handles HTML to PDF conversion with proper error handling
 * Compatible with collab project's report generation system
 */
export class ReportGenerationHelper {
  constructor() {
    this.browser = null;
  }

  /**
   * Initialize Puppeteer browser instance
   * @returns {Promise<void>}
   */
  async initializeBrowser() {
    if (this.browser) {
      return;
    }

    try {
      console.log('Initializing Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 30000
        // Let Puppeteer download and use its own Chromium
      });
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      console.error('Browser error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Browser initialization failed: ${error.message}`);
    }
  }

  /**
   * Close browser instance
   * @returns {Promise<void>}
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate PDF from HTML content
   * @param {string} htmlContent - HTML content to convert
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generatePDFFromHTML(htmlContent, options = {}) {
    await this.initializeBrowser();
    
    const page = await this.browser.newPage();
    
    try {
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1
      });

      // Set HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Generate PDF with options
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        ...options
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      return pdfBuffer;

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Generate DPG Report PDF
   * @param {Object} finalObject - Report data object
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateDPGReport(finalObject) {
    try {
      await this.initializeBrowser();
      const page = await this.browser.newPage();
      
      // Load DPG HTML template
      const htmlContent = await this.loadDPGHTML();
      await page.setContent(htmlContent);
      
      // Generate PDF using DPG report function
      const pdfBuffer = await generateDPGReport(page, finalObject);
      
      await page.close();
      return pdfBuffer;
    } catch (error) {
      console.error('DPG report generation failed:', error);
      throw new Error(`DPG report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Thermal or Power Report PDF
   * @param {Object} finalObject - Report data object
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateThermalOrPowerReport(finalObject) {
    try {
      await this.initializeBrowser();
      const page = await this.browser.newPage();
      
      // Load Thermal HTML template
      const htmlContent = await this.loadThermalHTML();
      await page.setContent(htmlContent);
      
      // Generate PDF using Thermal report function
      const pdfBuffer = await generateThermalOrPowerReport(page, finalObject);
      
      await page.close();
      return pdfBuffer;
    } catch (error) {
      console.error('Thermal/Power report generation failed:', error);
      throw new Error(`Thermal/Power report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate DCPS Report PDF
   * @param {Object} finalObject - Report data object
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateDCPSReport(finalObject) {
    try {
      await this.initializeBrowser();
      const page = await this.browser.newPage();
      
      // Load DCPS HTML template
      const htmlContent = await this.loadDCPSHTML();
      await page.setContent(htmlContent);
      
      // Generate PDF using DCPS report function
      const pdfBuffer = await generateDCPSReport(page, finalObject);
      
      await page.close();
      return pdfBuffer;
    } catch (error) {
      console.error('DCPS report generation failed:', error);
      throw new Error(`DCPS report generation failed: ${error.message}`);
    }
  }

  /**
   * Load DPG HTML template
   * @returns {Promise<string>} HTML content
   */
  async loadDPGHTML() {
    // Load the actual DPG HTML template
    const fs = await import('fs');
    const path = await import('path');
    const templatePath = path.join(process.cwd(), 'templates', 'dpg.html');
    return fs.readFileSync(templatePath, 'utf8');
  }

  /**
   * Load Thermal HTML template
   * @returns {Promise<string>} HTML content
   */
  async loadThermalHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thermal Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { line-height: 1.6; }
        .footer { margin-top: 50px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Thermal/Power Field Service Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="content">
        <p>This is a placeholder for the Thermal/Power report template.</p>
        <p>The actual template will be loaded from the templates directory.</p>
    </div>
    <div class="footer">
        <p>Generated by Notification Report Service</p>
    </div>
</body>
</html>`;
  }

  /**
   * Load DCPS HTML template
   * @returns {Promise<string>} HTML content
   */
  async loadDCPSHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DCPS Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { line-height: 1.6; }
        .footer { margin-top: 50px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DCPS Field Service Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="content">
        <p>This is a placeholder for the DCPS report template.</p>
        <p>The actual template will be loaded from the templates directory.</p>
    </div>
    <div class="footer">
        <p>Generated by Notification Report Service</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate sample notification report for testing
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateSampleReport() {
    const sampleData = {
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

    return await this.generateDPGReport(sampleData);
  }
}

// Export singleton instance
export const reportGenerationHelper = new ReportGenerationHelper();

// Export individual functions for convenience
export const generateDPGReport = (finalObject) => 
  reportGenerationHelper.generateDPGReport(finalObject);

export const generateThermalOrPowerReport = (finalObject) => 
  reportGenerationHelper.generateThermalOrPowerReport(finalObject);

export const generateDCPSReport = (finalObject) => 
  reportGenerationHelper.generateDCPSReport(finalObject);

export const generateSampleReport = () => 
  reportGenerationHelper.generateSampleReport();
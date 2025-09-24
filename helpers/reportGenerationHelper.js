import puppeteer from 'puppeteer';
import { generateReportTemplate, generateSimpleTemplate } from '../templates/reportTemplate.js';

/**
 * PDF Generation Helper using Puppeteer
 * Handles HTML to PDF conversion with proper error handling
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
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        timeout: 30000
      });
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw new Error('Browser initialization failed');
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
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
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
   * Generate notification report PDF
   * @param {Object} reportData - Report data object
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateReport(reportData, options = {}) {
    try {
      // Generate HTML template
      const htmlContent = generateReportTemplate(reportData);
      
      // Convert to PDF
      const pdfBuffer = await this.generatePDFFromHTML(htmlContent, options);
      
      return pdfBuffer;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate simple report PDF
   * @param {Object} reportData - Simple report data
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateSimpleReport(reportData, options = {}) {
    try {
      // Generate simple HTML template
      const htmlContent = generateSimpleTemplate(reportData);
      
      // Convert to PDF
      const pdfBuffer = await this.generatePDFFromHTML(htmlContent, options);
      
      return pdfBuffer;
    } catch (error) {
      console.error('Simple report generation failed:', error);
      throw new Error(`Simple report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate sample notification report for testing
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateSampleReport() {
    const sampleData = {
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
        },
        {
          type: 'Error',
          message: 'Database connection timeout occurred',
          priority: 'High',
          status: 'Resolved',
          source: 'Database Monitor',
          user: 'dba-team',
          timestamp: new Date(Date.now() - 14400000).toISOString()
        },
        {
          type: 'Success',
          message: 'Backup completed successfully',
          priority: 'Low',
          status: 'Resolved',
          source: 'Backup Service',
          user: 'backup-service',
          timestamp: new Date(Date.now() - 18000000).toISOString()
        }
      ],
      metadata: {
        generatedBy: 'notification-report-service',
        version: '1.0.0',
        environment: 'production'
      }
    };

    return await this.generateReport(sampleData);
  }
}

// Export singleton instance
export const reportGenerationHelper = new ReportGenerationHelper();

// Export individual functions for convenience
export const generateReport = (reportData, options) => 
  reportGenerationHelper.generateReport(reportData, options);

export const generateSimpleReport = (reportData, options) => 
  reportGenerationHelper.generateSimpleReport(reportData, options);

export const generateSampleReport = () => 
  reportGenerationHelper.generateSampleReport();
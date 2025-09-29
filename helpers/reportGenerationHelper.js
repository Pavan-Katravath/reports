import { generateDPGReport as generateDPGReportPDF, generateThermalOrPowerReport as generateThermalOrPowerReportPDF, generateDCPSReport as generateDCPSReportPDF, generateAirReport as generateAirReportPDF } from '../templates/reportTemplate.js';

/**
 * PDF Generation Helper using PDFKit
 * Handles PDF generation with proper error handling
 * Compatible with collab project's report generation system
 */
export class ReportGenerationHelper {
  constructor() {
    // No browser initialization needed for PDFKit
  }

  /**
   * Generate DPG Report PDF
   * @param {Object} finalObject - Report data object
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateDPGReport(finalObject) {
    try {
      // Generate PDF using PDFKit-based DPG report function
      const pdfBuffer = await generateDPGReportPDF(finalObject);
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
      // Generate PDF using PDFKit-based Thermal report function
      const pdfBuffer = await generateThermalOrPowerReportPDF(finalObject);
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
      // Generate PDF using PDFKit-based DCPS report function
      const pdfBuffer = await generateDCPSReportPDF(finalObject);
      return pdfBuffer;
    } catch (error) {
      console.error('DCPS report generation failed:', error);
      throw new Error(`DCPS report generation failed: ${error.message}`);
    }
  }
  /**
   * Generate Air Report PDF using custom HTML template
   * @param {Object} finalObject - Report data object
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateAirReport(finalObject) {
    try {
      // Generate PDF using PDFKit-based Air report function with custom HTML template
      const pdfBuffer = await generateAirReportPDF(finalObject);
      return pdfBuffer;
    } catch (error) {
      console.error('Air report generation failed:', error);
      throw new Error(`Air report generation failed: ${error.message}`);
    }
  }

}

// Export singleton instance
export const reportGenerationHelper = new ReportGenerationHelper();

// Export individual functions for convenience
export const generateDPGReport = (finalObject) => 
  reportGenerationHelper.generateDPGReport(finalObject);

export const generateThermalOrPowerReport = (finalObject) => 
  reportGenerationHelper.generateThermalOrPowerReport(finalObject);

export const generateAirReport = (finalObject) => 
  reportGenerationHelper.generateAirReport(finalObject);


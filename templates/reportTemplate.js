import PDFDocument from 'pdfkit';

/**
 * Generate DPG Report PDF using PDFKit
 * @param {Object} finalObject - Report data object containing param, room, paramObj, logo, tableHTML, returnedEls, issuedEls
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateDPGReport(finalObject) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Add logo if available
            if (finalObject.logo && finalObject.logo.startsWith('data:image')) {
                try {
                    const base64Data = finalObject.logo.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imageBuffer, 50, 50, { width: 100, height: 50 });
                } catch (logoError) {
                    console.warn('Logo processing failed:', logoError.message);
                }
            }

            // Add title
            doc.fontSize(20).text('DPG Report', 50, 120);
            
            // Add call number if available
            if (finalObject.param?.call_no) {
                doc.fontSize(14).text(`Call Number: ${finalObject.param.call_no}`, 50, 160);
            }

            // Add product group
            if (finalObject.param?.product_group) {
                doc.text(`Product Group: ${finalObject.param.product_group}`, 50, 180);
            }

            // Add room information
            if (finalObject.room?.name) {
                doc.text(`Room: ${finalObject.room.name}`, 50, 200);
            }

            // Add issued elements table
            let yPosition = 240;
            if (finalObject.issuedEls && finalObject.issuedEls.length > 0) {
                doc.text('Issued Elements:', 50, yPosition);
                yPosition += 20;
                
                finalObject.issuedEls.forEach((item, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                    doc.fontSize(10).text(`${index + 1}. ${item}`, 70, yPosition);
                    yPosition += 20;
                });
            }

            // Add returned elements table
            if (finalObject.returnedEls && finalObject.returnedEls.length > 0) {
                doc.text('Returned Elements:', 50, yPosition + 20);
                yPosition += 40;
                
                finalObject.returnedEls.forEach((item, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                    doc.fontSize(10).text(`${index + 1}. ${item}`, 70, yPosition);
                    yPosition += 20;
                });
            }

            // Add safety table if available
            if (finalObject.tableHTML) {
                doc.text('Safety Information:', 50, yPosition + 20);
                doc.text('See attached safety documentation for details.', 70, yPosition + 40);
            }

            // Add timestamp
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 100);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate Thermal or Power Report PDF using PDFKit
 * @param {Object} finalObject - Report data object
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateThermalOrPowerReport(finalObject) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Add logo if available
            if (finalObject.logo && finalObject.logo.startsWith('data:image')) {
                try {
                    const base64Data = finalObject.logo.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imageBuffer, 50, 50, { width: 100, height: 50 });
                } catch (logoError) {
                    console.warn('Logo processing failed:', logoError.message);
                }
            }

            // Add title
            const reportType = finalObject.param?.product_group === 'air' ? 'Thermal Report' : 'Power Report';
            doc.fontSize(20).text(reportType, 50, 120);
            
            // Add call number if available
            if (finalObject.param?.call_no) {
                doc.fontSize(14).text(`Call Number: ${finalObject.param.call_no}`, 50, 160);
            }

            // Add product group
            if (finalObject.param?.product_group) {
                doc.text(`Product Group: ${finalObject.param.product_group}`, 50, 180);
            }

            // Add room information
            if (finalObject.room?.name) {
                doc.text(`Room: ${finalObject.room.name}`, 50, 200);
            }

            // Add issued elements table
            let yPosition = 240;
            if (finalObject.issuedEls && finalObject.issuedEls.length > 0) {
                doc.text('Issued Elements:', 50, yPosition);
                yPosition += 20;
                
                finalObject.issuedEls.forEach((item, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                    doc.fontSize(10).text(`${index + 1}. ${item}`, 70, yPosition);
                    yPosition += 20;
                });
            }

            // Add returned elements table
            if (finalObject.returnedEls && finalObject.returnedEls.length > 0) {
                doc.text('Returned Elements:', 50, yPosition + 20);
                yPosition += 40;
                
                finalObject.returnedEls.forEach((item, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                    doc.fontSize(10).text(`${index + 1}. ${item}`, 70, yPosition);
                    yPosition += 20;
                });
            }

            // Add safety table if available
            if (finalObject.tableHTML) {
                doc.text('Safety Information:', 50, yPosition + 20);
                doc.text('See attached safety documentation for details.', 70, yPosition + 40);
            }

            // Add timestamp
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 100);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate DCPS Report PDF using PDFKit
 * @param {Object} finalObject - Report data object
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateDCPSReport(finalObject) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Add logo if available
            if (finalObject.logo && finalObject.logo.startsWith('data:image')) {
                try {
                    const base64Data = finalObject.logo.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imageBuffer, 50, 50, { width: 100, height: 50 });
                } catch (logoError) {
                    console.warn('Logo processing failed:', logoError.message);
                }
            }

            // Add title
            doc.fontSize(20).text('DCPS Report', 50, 120);
            
            // Add call number if available
            if (finalObject.param?.call_no) {
                doc.fontSize(14).text(`Call Number: ${finalObject.param.call_no}`, 50, 160);
            }

            // Add product group
            if (finalObject.param?.product_group) {
                doc.text(`Product Group: ${finalObject.param.product_group}`, 50, 180);
            }

            // Add room information
            if (finalObject.room?.name) {
                doc.text(`Room: ${finalObject.room.name}`, 50, 200);
            }

            // Add issued elements table
            let yPosition = 240;
            if (finalObject.issuedEls && finalObject.issuedEls.length > 0) {
                doc.text('Issued Elements:', 50, yPosition);
                yPosition += 20;
                
                finalObject.issuedEls.forEach((item, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                    doc.fontSize(10).text(`${index + 1}. ${item}`, 70, yPosition);
                    yPosition += 20;
                });
            }

            // Add returned elements table
            if (finalObject.returnedEls && finalObject.returnedEls.length > 0) {
                doc.text('Returned Elements:', 50, yPosition + 20);
                yPosition += 40;
                
                finalObject.returnedEls.forEach((item, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                    doc.fontSize(10).text(`${index + 1}. ${item}`, 70, yPosition);
                    yPosition += 20;
                });
            }

            // Add timestamp
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 100);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate Part Returned and Consumed Table
 * @param {Object} param - Parameters object
 * @param {number} maxItems - Maximum number of items to include
 * @param {boolean} includeDetails - Whether to include detailed information
 * @returns {Object} Object containing issuedEls and returnedEls arrays
 */
export function generatePartReturnedAndConsumedTable(param, maxItems = 3, includeDetails = false) {
    const issuedEls = [];
    const returnedEls = [];
    
    // Mock data generation - replace with actual data processing
    if (param && typeof param === 'object') {
        // Generate sample issued elements
        for (let i = 1; i <= Math.min(maxItems, 5); i++) {
            issuedEls.push(`Issued Item ${i} - ${param.product_group || 'Unknown'}`);
        }
        
        // Generate sample returned elements
        for (let i = 1; i <= Math.min(maxItems, 3); i++) {
            returnedEls.push(`Returned Item ${i} - ${param.product_group || 'Unknown'}`);
        }
    }
    
    return { issuedEls, returnedEls };
}

/**
 * Generate Safety Table HTML
 * @param {Object} formdata - Form data object
 * @returns {string} HTML string for safety table
 */
export function generateSafetyTable(formdata) {
    if (!formdata || typeof formdata !== 'object') {
        return '';
    }
    
    // Generate basic safety table HTML
    let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    html += '<tr><th>Safety Item</th><th>Status</th><th>Notes</th></tr>';
    
    // Add sample safety items
    const safetyItems = [
        { item: 'Safety Check 1', status: 'Passed', notes: 'All systems operational' },
        { item: 'Safety Check 2', status: 'Passed', notes: 'No issues detected' },
        { item: 'Safety Check 3', status: 'Passed', notes: 'Compliance verified' }
    ];
    
    safetyItems.forEach(item => {
        html += `<tr><td>${item.item}</td><td>${item.status}</td><td>${item.notes}</td></tr>`;
    });
    
    html += '</table>';
    return html;
}
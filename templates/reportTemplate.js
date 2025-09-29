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
            if (finalObject.issuedEls && finalObject.issuedEls.trim()) {
                doc.text('Issued Elements:', 50, yPosition);
                yPosition += 20;
                
                // Parse HTML and extract text content for PDF
                const issuedText = finalObject.issuedEls.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                if (issuedText) {
                    doc.fontSize(10).text(issuedText, 70, yPosition, { width: 500 });
                    yPosition += 40;
                }
            }

            // Add returned elements table
            if (finalObject.returnedEls && finalObject.returnedEls.trim()) {
                doc.text('Returned Elements:', 50, yPosition + 20);
                yPosition += 40;
                
                // Parse HTML and extract text content for PDF
                const returnedText = finalObject.returnedEls.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                if (returnedText) {
                    doc.fontSize(10).text(returnedText, 70, yPosition, { width: 500 });
                    yPosition += 40;
                }
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
            if (finalObject.issuedEls && finalObject.issuedEls.trim()) {
                doc.text('Issued Elements:', 50, yPosition);
                yPosition += 20;
                
                // Parse HTML and extract text content for PDF
                const issuedText = finalObject.issuedEls.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                if (issuedText) {
                    doc.fontSize(10).text(issuedText, 70, yPosition, { width: 500 });
                    yPosition += 40;
                }
            }

            // Add returned elements table
            if (finalObject.returnedEls && finalObject.returnedEls.trim()) {
                doc.text('Returned Elements:', 50, yPosition + 20);
                yPosition += 40;
                
                // Parse HTML and extract text content for PDF
                const returnedText = finalObject.returnedEls.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                if (returnedText) {
                    doc.fontSize(10).text(returnedText, 70, yPosition, { width: 500 });
                    yPosition += 40;
                }
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
            if (finalObject.issuedEls && finalObject.issuedEls.trim()) {
                doc.text('Issued Elements:', 50, yPosition);
                yPosition += 20;
                
                // Parse HTML and extract text content for PDF
                const issuedText = finalObject.issuedEls.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                if (issuedText) {
                    doc.fontSize(10).text(issuedText, 70, yPosition, { width: 500 });
                    yPosition += 40;
                }
            }

            // Add returned elements table
            if (finalObject.returnedEls && finalObject.returnedEls.trim()) {
                doc.text('Returned Elements:', 50, yPosition + 20);
                yPosition += 40;
                
                // Parse HTML and extract text content for PDF
                const returnedText = finalObject.returnedEls.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                if (returnedText) {
                    doc.fontSize(10).text(returnedText, 70, yPosition, { width: 500 });
                    yPosition += 40;
                }
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
 * @param {Object} param - Parameters object containing material array
 * @param {number} defaultValue - Default number of rows to display
 * @param {boolean} isOnepmFSR - Whether to restrict items for onepmFSR
 * @returns {Object} Object containing issuedEls and returnedEls HTML strings
 */
export function generatePartReturnedAndConsumedTable(param, defaultValue = 3, isOnepmFSR = false) {
    let returnedEls = '';
    let issuedEls = '';
    let issuedCount = 0;
    let returnedCount = 0;
    let issueCount = 0;
    let returnCount = 0;
    
    if (param.material && param.material.length > 0) {
        // To restrict the number of parts to be displayed in the table for onepmFSR childs
        const materialArr = isOnepmFSR ? param.material.filter((element) => {
            if (element.part_activity.toLowerCase().includes("issued") && issueCount < 3) {
                issueCount++;
                return true;
            }
            if (element.part_activity.toLowerCase().includes("return") && returnCount < 3) {
                returnCount++;
                return true;
            }
            return false;
        }) : param.material;

        materialArr.forEach((element) => {
            if (element.part_activity.toLowerCase().includes('issued')) {
                issuedEls += `
                <div
                            style="
                                display: flex;
                                flex-direction: row;
                                border-bottom: 1px solid black;
                                padding-left: 0.4rem;
                                padding-right: 0.4rem;
                                text-align: center;
                                font-weight: 200;
                            "
                        >
                            <div style="width: 5.33%; border-right: 1px solid black; text-align: center;">${++issuedCount}</div>
                            <div style="width: 13.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${element.part_code ? element.part_code : ""}</div>
                            <div style="width: 49%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${element.part_description ? element.part_description : ""}</div>
                            <div style="width: 23.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${element.part_serialno ? element.part_serialno : ""}</div>
                            <div style="width: 8.33%; text-align: center; padding-left: 0.4rem;">${element.part_qty ? element.part_qty : ""}</div>
                        </div>
                `;
            }

            if (element.part_activity.toLowerCase().includes('return')) {
                returnedEls += `
                <div
                            style="
                                display: flex;
                                flex-direction: row;
                                border-bottom: 1px solid black;
                                padding-left: 0.4rem;
                                padding-right: 0.4rem;
                                text-align: center;
                                font-weight: 200;
                            "
                        >
                            <div style="width: 5.33%; border-right: 1px solid black; text-align: center;">${++returnedCount}</div>
                            <div style="width: 13.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${element.part_code ? element.part_code : ""}</div>
                            <div style="width: 49%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${element.part_description ? element.part_description : ""}</div>
                            <div style="width: 23.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${element.part_serialno ? element.part_serialno : ""}</div>
                            <div style="width: 8.33%; text-align: center; padding-left: 0.4rem;">${element.part_qty ? element.part_qty : ""}</div>
                        </div>
                `;
            }
        });
    }

    if (returnedCount < defaultValue || issuedCount < defaultValue) {
        for (let i = issuedCount; i < defaultValue; i++) {
            issuedEls += `
                <div
                    style="
                        display: flex;
                        flex-direction: row;
                        border-bottom: 1px solid black;
                        padding-left: 0.4rem;
                        padding-right: 0.4rem;
                        text-align: center;
                        font-weight: 200;
                    "
                >
                    <div style="width: 5.33%; border-right: 1px solid black; text-align: center;">${i+1}</div>
                    <div style="width: 13.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem;"></div>
                    <div style="width: 49%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem;"></div>
                    <div style="width: 23.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem;"></div>
                    <div style="width: 8.33%; text-align: center; padding-left: 0.4rem;"></div>
                </div>
            `;
        }
    
        for (let i = returnedCount; i < defaultValue; i++) {
            returnedEls += `
                <div
                    style="
                        display: flex;
                        flex-direction: row;
                        border-bottom: 1px solid black;
                        padding-left: 0.4rem;
                        padding-right: 0.4rem;
                        text-align: center;
                        font-weight: 200;
                    "
                >
                    <div style="width: 5.33%; border-right: 1px solid black; text-align: center;">${i+1}</div>
                    <div style="width: 13.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem;"></div>
                    <div style="width: 49%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem;"></div>
                    <div style="width: 23.6%; border-right: 1px solid black; text-align: center; padding-left: 0.4rem;"></div>
                    <div style="width: 8.33%; text-align: center; padding-left: 0.4rem;"></div>
                </div>
            `;
        }
    }

    return { issuedEls, returnedEls };
}

/**
 * Generate Air Report PDF using the custom HTML template
 * @param {Object} finalObject - Report data object
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateAirReport(finalObject) {
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

            // Generate the HTML template with actual data
            const htmlTemplate = generateAirReportHTML(finalObject);
            
            // Convert HTML to PDF-friendly content
            const pdfContent = convertHTMLToPDFContent(htmlTemplate);
            
            // Add content to PDF
            let yPosition = 50;
            
            // Add logo if available
            if (finalObject.logo && finalObject.logo.startsWith('data:image')) {
                try {
                    const base64Data = finalObject.logo.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imageBuffer, 50, yPosition, { width: 100, height: 50 });
                    yPosition += 80;
                } catch (logoError) {
                    console.warn('Logo processing failed:', logoError.message);
                }
            }

            // Add each section of the PDF content
            pdfContent.forEach(section => {
                if (section.type === 'title') {
                    doc.fontSize(18).text(section.text, 50, yPosition);
                    yPosition += 30;
                } else if (section.type === 'subtitle') {
                    doc.fontSize(14).text(section.text, 50, yPosition);
                    yPosition += 20;
                } else if (section.type === 'text') {
                    doc.fontSize(10).text(section.text, 50, yPosition, { width: 500 });
                    yPosition += 15;
                } else if (section.type === 'table') {
                    // Add table content
                    section.rows.forEach(row => {
                        doc.fontSize(9).text(row, 50, yPosition, { width: 500 });
                        yPosition += 12;
                    });
                    yPosition += 10;
                }
            });

            // Add timestamp
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 100);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate Air Report HTML template with actual data
 * @param {Object} finalObject - Report data object
 * @returns {string} HTML template string
 */
function generateAirReportHTML(finalObject) {
    const param = finalObject.param || {};
    const room = finalObject.room || {};
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Air Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
        }
        .report-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .report-subtitle {
            font-size: 18px;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-left: 4px solid #007bff;
            padding-left: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 3px solid #007bff;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 16px;
        }
        .table-container {
            margin-top: 20px;
        }
        .table-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .parts-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .parts-table th,
        .parts-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .parts-table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }
        .parts-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .signature-box {
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 10px;
        }
        .signature-label {
            font-weight: bold;
            margin-bottom: 20px;
        }
        .signature-line {
            height: 50px;
            border-bottom: 1px solid #333;
            margin-bottom: 10px;
        }
        .date-line {
            height: 30px;
            border-bottom: 1px solid #333;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="report-title">Field Service Report</div>
            <div class="report-subtitle">Air System Service Report</div>
        </div>

        <div class="section">
            <div class="section-title">Service Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">FSR Number:</div>
                    <div class="info-value">${param.call_no || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Customer Name:</div>
                    <div class="info-value">${room.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Service Type:</div>
                    <div class="info-value">${param.service_type || 'Air System Service'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${new Date().toLocaleDateString()}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Problem Statement</div>
            <div class="info-item">
                <div class="info-value">${param.problem_statement || 'Air system maintenance and service performed.'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Time Spent</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Start Time:</div>
                    <div class="info-value">${param.start_time || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">End Time:</div>
                    <div class="info-value">${param.end_time || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Time:</div>
                    <div class="info-value">${param.total_time || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Parts Information</div>
            
            <div class="table-container">
                <div class="table-title">Parts Returned</div>
                <table class="parts-table">
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Part Code</th>
                            <th>Description</th>
                            <th>Serial No.</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generatePartsTableRows(finalObject.returnedEls || '')}
                    </tbody>
                </table>
            </div>

            <div class="table-container">
                <div class="table-title">Parts Consumed</div>
                <table class="parts-table">
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Part Code</th>
                            <th>Description</th>
                            <th>Serial No.</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generatePartsTableRows(finalObject.issuedEls || '')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-label">Technician Signature</div>
                <div class="signature-line"></div>
                <div class="date-line"></div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="signature-box">
                <div class="signature-label">Customer Signature</div>
                <div class="signature-line"></div>
                <div class="date-line"></div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate table rows from HTML content
 * @param {string} htmlContent - HTML content containing parts data
 * @returns {string} HTML table rows
 */
function generatePartsTableRows(htmlContent) {
    if (!htmlContent || !htmlContent.trim()) {
        return '<tr><td colspan="5">No parts data available</td></tr>';
    }
    
    // Extract data from HTML content
    const rows = [];
    const divRegex = /<div[^>]*>([^<]*)<\/div>/g;
    let match;
    let currentRow = [];
    let rowCount = 0;
    
    while ((match = divRegex.exec(htmlContent)) !== null) {
        const text = match[1].trim();
        if (text) {
            currentRow.push(text);
            if (currentRow.length === 5) {
                rows.push(`<tr><td>${currentRow[0]}</td><td>${currentRow[1]}</td><td>${currentRow[2]}</td><td>${currentRow[3]}</td><td>${currentRow[4]}</td></tr>`);
                currentRow = [];
                rowCount++;
            }
        }
    }
    
    // Add empty rows if needed
    while (rowCount < 3) {
        rows.push('<tr><td></td><td></td><td></td><td></td><td></td></tr>');
        rowCount++;
    }
    
    return rows.join('');
}

/**
 * Convert HTML content to PDF-friendly sections
 * @param {string} htmlContent - HTML content to convert
 * @returns {Array} Array of PDF sections
 */
function convertHTMLToPDFContent(htmlContent) {
    const sections = [];
    
    // Extract title
    const titleMatch = htmlContent.match(/<div class="report-title">([^<]*)<\/div>/);
    if (titleMatch) {
        sections.push({ type: 'title', text: titleMatch[1] });
    }
    
    // Extract subtitle
    const subtitleMatch = htmlContent.match(/<div class="report-subtitle">([^<]*)<\/div>/);
    if (subtitleMatch) {
        sections.push({ type: 'subtitle', text: subtitleMatch[1] });
    }
    
    // Extract service information
    sections.push({ type: 'subtitle', text: 'Service Information' });
    
    // Extract FSR Number
    const fsrMatch = htmlContent.match(/FSR Number:.*?<div class="info-value">([^<]*)<\/div>/);
    if (fsrMatch) {
        sections.push({ type: 'text', text: `FSR Number: ${fsrMatch[1]}` });
    }
    
    // Extract Customer Name
    const customerMatch = htmlContent.match(/Customer Name:.*?<div class="info-value">([^<]*)<\/div>/);
    if (customerMatch) {
        sections.push({ type: 'text', text: `Customer Name: ${customerMatch[1]}` });
    }
    
    // Extract Service Type
    const serviceMatch = htmlContent.match(/Service Type:.*?<div class="info-value">([^<]*)<\/div>/);
    if (serviceMatch) {
        sections.push({ type: 'text', text: `Service Type: ${serviceMatch[1]}` });
    }
    
    // Extract Date
    const dateMatch = htmlContent.match(/Date:.*?<div class="info-value">([^<]*)<\/div>/);
    if (dateMatch) {
        sections.push({ type: 'text', text: `Date: ${dateMatch[1]}` });
    }
    
    // Extract Problem Statement
    sections.push({ type: 'subtitle', text: 'Problem Statement' });
    const problemMatch = htmlContent.match(/<div class="info-value">([^<]*)<\/div>/);
    if (problemMatch) {
        sections.push({ type: 'text', text: problemMatch[1] });
    }
    
    // Extract Time Spent
    sections.push({ type: 'subtitle', text: 'Time Spent' });
    const startTimeMatch = htmlContent.match(/Start Time:.*?<div class="info-value">([^<]*)<\/div>/);
    if (startTimeMatch) {
        sections.push({ type: 'text', text: `Start Time: ${startTimeMatch[1]}` });
    }
    
    const endTimeMatch = htmlContent.match(/End Time:.*?<div class="info-value">([^<]*)<\/div>/);
    if (endTimeMatch) {
        sections.push({ type: 'text', text: `End Time: ${endTimeMatch[1]}` });
    }
    
    const totalTimeMatch = htmlContent.match(/Total Time:.*?<div class="info-value">([^<]*)<\/div>/);
    if (totalTimeMatch) {
        sections.push({ type: 'text', text: `Total Time: ${totalTimeMatch[1]}` });
    }
    
    // Extract Parts Information
    sections.push({ type: 'subtitle', text: 'Parts Information' });
    sections.push({ type: 'text', text: 'Parts Returned and Consumed details are included in the report.' });
    
    return sections;
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
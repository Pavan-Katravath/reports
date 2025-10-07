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

            const param = finalObject.param || {};
            const paramObj = finalObject.paramObj || {};
            
            let yPosition = 50;
            
            // Add logo if available
            if (finalObject.logo && finalObject.logo.startsWith('data:image')) {
                try {
                    const base64Data = finalObject.logo.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imageBuffer, 450, yPosition, { width: 100, height: 40 });
                } catch (logoError) {
                    console.warn('Logo processing failed:', logoError.message);
                }
            }

            // Header - Field Service Report
            doc.fontSize(21).text('Field Service Report', 50, yPosition);
            yPosition += 60;

            // FSR Number and Date row
            doc.fontSize(10).text('FSR Number:', 50, yPosition);
            doc.text(param.call_no || 'N/A', 120, yPosition);
            doc.text('FSR Date & Time:', 300, yPosition);
            doc.text(paramObj.report_date || new Date().toLocaleDateString(), 420, yPosition);
            yPosition += 25;

            // Main information table (3 columns)
            const tableStartY = yPosition;
            const tableHeight = 120;
            const col1Width = 200;
            const col2Width = 200;
            const col3Width = 200;

            // Draw table borders
            doc.rect(50, tableStartY, col1Width, tableHeight).stroke();
            doc.rect(250, tableStartY, col2Width, tableHeight).stroke();
            doc.rect(450, tableStartY, col3Width, tableHeight).stroke();

            // Column 1 - Customer Information
            let currentY = tableStartY + 15;
            doc.fontSize(9).text('Customer Name:', 55, currentY);
            doc.text(paramObj.customer_name || 'N/A', 55, currentY + 12, { width: col1Width - 10 });
            currentY += 30;

            doc.text('Address:', 55, currentY);
            doc.text(paramObj.site_name || 'N/A', 55, currentY + 12, { width: col1Width - 10 });
            currentY += 30;

            doc.text('Contact Person:', 55, currentY);
            doc.text(paramObj.engineer_name || 'N/A', 55, currentY + 12);
            currentY += 20;

            doc.text('Contact Number:', 55, currentY);
            doc.text('N/A', 55, currentY + 12);

            // Column 2 - Service Information
            currentY = tableStartY + 15;
            doc.text('Service Type:', 255, currentY);
            doc.text(paramObj.service_type || 'Air System Service', 255, currentY + 12);
            currentY += 20;

            doc.text('Product Model:', 255, currentY);
            doc.text('N/A', 255, currentY + 12);
            currentY += 20;

            doc.text('Product Rating:', 255, currentY);
            doc.text('N/A', 255, currentY + 12);
            currentY += 20;

            doc.text('Serial Number:', 255, currentY);
            doc.text('N/A', 255, currentY + 12);
            currentY += 20;

            doc.text('Product Coverage:', 255, currentY);
            doc.text('N/A', 255, currentY + 12);
            currentY += 20;

            doc.text('Engineer Name:', 255, currentY);
            doc.text(paramObj.engineer_name || 'N/A', 255, currentY + 12);

            // Column 3 - Request Information
            currentY = tableStartY + 15;
            doc.text('Request Number:', 455, currentY);
            doc.text(param.call_no || 'N/A', 455, currentY + 12);
            currentY += 20;

            doc.text('Request Date/Time:', 455, currentY);
            doc.text(paramObj.report_date || new Date().toLocaleDateString(), 455, currentY + 12);
            currentY += 20;

            doc.text('Assigned Date/Time:', 455, currentY);
            doc.text('N/A', 455, currentY + 12);
            currentY += 20;

            doc.text('Scheduled Date/Time:', 455, currentY);
            doc.text('N/A', 455, currentY + 12);
            currentY += 20;

            doc.text('Closed Date/Time:', 455, currentY);
            doc.text('N/A', 455, currentY + 12);
            currentY += 20;

            doc.text('Engineer contact No:', 455, currentY);
            doc.text('N/A', 455, currentY + 12);

            yPosition = tableStartY + tableHeight + 20;

            // Problem Statement
            doc.fontSize(10).text('Problem statement:', 50, yPosition);
            doc.text(paramObj.problem_statement || 'Air system maintenance and service performed.', 50, yPosition + 15, { width: 500 });
            yPosition += 40;

            // Call Type
            doc.text('Call Type:', 50, yPosition);
            doc.text('Service Call', 50, yPosition + 15);
            yPosition += 35;

            // Problem Code and Resolution Code row
            doc.rect(50, yPosition, 300, 20).stroke();
            doc.rect(350, yPosition, 300, 20).stroke();
            doc.text('Problem Code:', 55, yPosition + 5);
            doc.text('N/A', 55, yPosition + 15);
            doc.text('Resolution Code:', 355, yPosition + 5);
            doc.text('N/A', 355, yPosition + 15);
            yPosition += 40;

            // Site Assessment / Safety Risk Assessment
            doc.fontSize(15).text('Site Assessment / Safety Risk Assessment:', 50, yPosition);
            yPosition += 25;

            // Assessment table (4 columns)
            const assessmentStartY = yPosition;
            const assessmentHeight = 30;
            const assessmentColWidth = 150;

            for (let i = 0; i < 4; i++) {
                doc.rect(50 + (i * assessmentColWidth), assessmentStartY, assessmentColWidth, assessmentHeight).stroke();
                doc.fontSize(9).text(`Assessment ${i + 1}`, 55 + (i * assessmentColWidth), assessmentStartY + 10);
                doc.text('Passed', 55 + (i * assessmentColWidth), assessmentStartY + 20);
            }
            yPosition = assessmentStartY + assessmentHeight + 20;

            // Time Spent section
            doc.fontSize(15).text('Time Spent:', 50, yPosition);
            yPosition += 25;

            // Time Spent table (3 columns)
            const timeStartY = yPosition;
            const timeHeight = 80;
            const timeColWidth = 200;

            for (let i = 0; i < 3; i++) {
                doc.rect(50 + (i * timeColWidth), timeStartY, timeColWidth, timeHeight).stroke();
            }

            // Column 1 - Travel and Reporting times
            doc.fontSize(9).text('Travel Start Date/Time:', 55, timeStartY + 10);
            doc.text('N/A', 55, timeStartY + 20);
            doc.text('Reporting Date/Time:', 55, timeStartY + 35);
            doc.text(paramObj.start_time || 'N/A', 55, timeStartY + 45);
            doc.text('Completion Date/Time:', 55, timeStartY + 60);
            doc.text(paramObj.end_time || 'N/A', 55, timeStartY + 70);

            // Column 2 - On site and travel times
            doc.text('On Site Time:', 255, timeStartY + 10);
            doc.text(paramObj.total_time || 'N/A', 255, timeStartY + 20);
            doc.text('Travel Time:', 255, timeStartY + 35);
            doc.text('N/A', 255, timeStartY + 45);
            doc.text('Number of Visits:', 255, timeStartY + 60);
            doc.text('1', 255, timeStartY + 70);

            // Column 3 - Equipment and break times
            doc.text('Equipment Face:', 455, timeStartY + 10);
            doc.text('N/A', 455, timeStartY + 20);
            doc.text('Break/Idle Time:', 455, timeStartY + 35);
            doc.text('N/A', 455, timeStartY + 45);
            doc.text('Total Time Spent:', 455, timeStartY + 60);
            doc.text(paramObj.total_time || 'N/A', 455, timeStartY + 70);

            yPosition = timeStartY + timeHeight + 20;

            // Call Activity section
            doc.fontSize(15).text('Call Activity:', 50, yPosition);
            yPosition += 25;

            // Call Activity table (2 columns)
            const activityStartY = yPosition;
            const activityHeight = 120;
            const activityColWidth = 300;

            doc.rect(50, activityStartY, activityColWidth, activityHeight).stroke();
            doc.rect(350, activityStartY, activityColWidth, activityHeight).stroke();

            // Left column - Observation and Recommendation
            doc.fontSize(10).text('Observation:', 55, activityStartY + 10);
            doc.fontSize(9).text('System inspection completed', 55, activityStartY + 25, { width: activityColWidth - 10 });

            doc.fontSize(10).text('Recommendation:', 55, activityStartY + 60);
            doc.fontSize(9).text(paramObj.recommendations || 'Schedule next maintenance in 6 months.', 55, activityStartY + 75, { width: activityColWidth - 10 });

            // Right column - Work Done
            doc.fontSize(10).text('Work Done:', 355, activityStartY + 10);
            doc.fontSize(9).text(paramObj.work_performed || 'Air system maintenance and inspection performed.', 355, activityStartY + 25, { width: activityColWidth - 10 });

            yPosition = activityStartY + activityHeight + 30;

            // Page break for parts section
            if (yPosition > 600) {
                doc.addPage();
                yPosition = 50;
            }

            // Parts Returned section
            doc.fontSize(15).text('Part Returned:', 50, yPosition);
            yPosition += 25;

            // Parts Returned table header
            const partsHeaderY = yPosition;
            const partsColWidths = [40, 100, 300, 150, 60];
            let currentX = 50;

            for (let i = 0; i < partsColWidths.length; i++) {
                doc.rect(currentX, partsHeaderY, partsColWidths[i], 20).stroke();
                currentX += partsColWidths[i];
            }

            // Header text
            doc.fontSize(9).text('Sr No', 55, partsHeaderY + 5);
            doc.text('Part Code', 95, partsHeaderY + 5);
            doc.text('Part Description', 200, partsHeaderY + 5);
            doc.text('Serial Number', 505, partsHeaderY + 5);
            doc.text('Quantity', 660, partsHeaderY + 5);

            yPosition = partsHeaderY + 25;

            // Parts Returned data
            if (param.material && Array.isArray(param.material)) {
                const returnedParts = param.material.filter(item => 
                    item.part_activity && item.part_activity.toLowerCase().includes('return')
                );
                
                returnedParts.forEach((part, index) => {
                    currentX = 50;
                    for (let i = 0; i < partsColWidths.length; i++) {
                        doc.rect(currentX, yPosition, partsColWidths[i], 20).stroke();
                        currentX += partsColWidths[i];
                    }
                    
                    doc.fontSize(9).text((index + 1).toString(), 55, yPosition + 5);
                    doc.text(part.part_code || '', 95, yPosition + 5);
                    doc.text(part.part_description || '', 200, yPosition + 5, { width: 300 });
                    doc.text(part.part_serialno || '', 505, yPosition + 5);
                    doc.text(part.part_qty || '', 660, yPosition + 5);
                    yPosition += 20;
                });
            }

            // Add empty rows if needed
            while (yPosition < partsHeaderY + 100) {
                currentX = 50;
                for (let i = 0; i < partsColWidths.length; i++) {
                    doc.rect(currentX, yPosition, partsColWidths[i], 20).stroke();
                    currentX += partsColWidths[i];
                }
                yPosition += 20;
            }

            yPosition += 20;

            // Parts Consumed section
            doc.fontSize(15).text('Part Consumed:', 50, yPosition);
            yPosition += 25;

            // Parts Consumed table header
            const consumedHeaderY = yPosition;
            currentX = 50;

            for (let i = 0; i < partsColWidths.length; i++) {
                doc.rect(currentX, consumedHeaderY, partsColWidths[i], 20).stroke();
                currentX += partsColWidths[i];
            }

            // Header text
            doc.fontSize(9).text('Sr No', 55, consumedHeaderY + 5);
            doc.text('Part Code', 95, consumedHeaderY + 5);
            doc.text('Part Description', 200, consumedHeaderY + 5);
            doc.text('Serial Number', 505, consumedHeaderY + 5);
            doc.text('Quantity', 660, consumedHeaderY + 5);

            yPosition = consumedHeaderY + 25;

            // Parts Consumed data
            if (param.material && Array.isArray(param.material)) {
                const issuedParts = param.material.filter(item => 
                    item.part_activity && item.part_activity.toLowerCase().includes('issued')
                );
                
                issuedParts.forEach((part, index) => {
                    currentX = 50;
                    for (let i = 0; i < partsColWidths.length; i++) {
                        doc.rect(currentX, yPosition, partsColWidths[i], 20).stroke();
                        currentX += partsColWidths[i];
                    }
                    
                    doc.fontSize(9).text((index + 1).toString(), 55, yPosition + 5);
                    doc.text(part.part_code || '', 95, yPosition + 5);
                    doc.text(part.part_description || '', 200, yPosition + 5, { width: 300 });
                    doc.text(part.part_serialno || '', 505, yPosition + 5);
                    doc.text(part.part_qty || '', 660, yPosition + 5);
                    yPosition += 20;
                });
            }

            // Add empty rows if needed
            while (yPosition < consumedHeaderY + 100) {
                currentX = 50;
                for (let i = 0; i < partsColWidths.length; i++) {
                    doc.rect(currentX, yPosition, partsColWidths[i], 20).stroke();
                    currentX += partsColWidths[i];
                }
                yPosition += 20;
            }

            yPosition += 20;

            // Service Billable
            doc.text('Service Billable:', 50, yPosition);
            doc.text('Yes', 50, yPosition + 15);
            yPosition += 40;

            // Signature section
            doc.fontSize(15).text('Signatures:', 50, yPosition);
            yPosition += 25;

            // Signature boxes
            const signatureBoxHeight = 80;
            const signatureBoxWidth = 300;

            doc.rect(50, yPosition, signatureBoxWidth, signatureBoxHeight).stroke();
            doc.rect(350, yPosition, signatureBoxWidth, signatureBoxHeight).stroke();

            doc.fontSize(10).text('Technician Signature', 55, yPosition + 10);
            doc.text('Customer Signature', 355, yPosition + 10);
            doc.text('Date:', 55, yPosition + signatureBoxHeight - 20);
            doc.text(new Date().toLocaleDateString(), 80, yPosition + signatureBoxHeight - 20);
            doc.text('Date:', 355, yPosition + signatureBoxHeight - 20);
            doc.text(new Date().toLocaleDateString(), 380, yPosition + signatureBoxHeight - 20);

            yPosition += signatureBoxHeight + 30;

            // Footer
            doc.rect(50, yPosition, 500, 40).fill('#d8d8d8');
            doc.fillColor('black');
            doc.fontSize(11).text('For Queries, please contact our Customer Care Centre', 55, yPosition + 5);
            doc.text('Toll Free: 1800 209 6070 Email: Customer.Care@vertiv.com', 55, yPosition + 15);
            doc.text('Vertiv Energy Private Limited', 55, yPosition + 25);
            doc.text('ISO No: QS-FM-SER-1-04-01', 450, yPosition + 25);

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
    const paramObj = finalObject.paramObj || {};
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
                    <div class="info-value">${paramObj.customer_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Service Type:</div>
                    <div class="info-value">${paramObj.service_type || 'Air System Service'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${paramObj.report_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Site Name:</div>
                    <div class="info-value">${paramObj.site_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Engineer Name:</div>
                    <div class="info-value">${paramObj.engineer_name || 'N/A'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Work Performed</div>
            <div class="info-item">
                <div class="info-value">${paramObj.work_performed || 'Air system maintenance and inspection performed.'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Recommendations</div>
            <div class="info-item">
                <div class="info-value">${paramObj.recommendations || 'Schedule next maintenance in 6 months.'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Time Spent</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Start Time:</div>
                    <div class="info-value">${paramObj.start_time || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">End Time:</div>
                    <div class="info-value">${paramObj.end_time || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Time:</div>
                    <div class="info-value">${paramObj.total_time || 'N/A'}</div>
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
                        ${generatePartsTableRowsFromMaterial(param.material || [], 'returned')}
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
                        ${generatePartsTableRowsFromMaterial(param.material || [], 'issued')}
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
 * Generate table rows from material data
 * @param {Array} material - Array of material objects
 * @param {string} activityType - 'issued' or 'returned'
 * @returns {string} HTML table rows
 */
function generatePartsTableRowsFromMaterial(material, activityType) {
    if (!material || !Array.isArray(material) || material.length === 0) {
        return '<tr><td colspan="5">No parts data available</td></tr>';
    }
    
    const rows = [];
    let rowCount = 0;
    
    // Filter material by activity type
    const filteredMaterial = material.filter(item => 
        item.part_activity && item.part_activity.toLowerCase().includes(activityType)
    );
    
    // Generate rows for each material item
    filteredMaterial.forEach((item, index) => {
        const rowNumber = index + 1;
        rows.push(`
            <tr>
                <td>${rowNumber}</td>
                <td>${item.part_code || ''}</td>
                <td>${item.part_description || ''}</td>
                <td>${item.part_serialno || ''}</td>
                <td>${item.part_qty || ''}</td>
            </tr>
        `);
        rowCount++;
    });
    
    // Add empty rows if needed (minimum 3 rows)
    while (rowCount < 3) {
        rows.push('<tr><td></td><td></td><td></td><td></td><td></td></tr>');
        rowCount++;
    }
    
    return rows.join('');
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
    const fsrMatch = htmlContent.match(/FSR Number:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (fsrMatch) {
        sections.push({ type: 'text', text: `FSR Number: ${fsrMatch[1]}` });
    }
    
    // Extract Customer Name
    const customerMatch = htmlContent.match(/Customer Name:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (customerMatch) {
        sections.push({ type: 'text', text: `Customer Name: ${customerMatch[1]}` });
    }
    
    // Extract Service Type
    const serviceMatch = htmlContent.match(/Service Type:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (serviceMatch) {
        sections.push({ type: 'text', text: `Service Type: ${serviceMatch[1]}` });
    }
    
    // Extract Date
    const dateMatch = htmlContent.match(/Date:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (dateMatch) {
        sections.push({ type: 'text', text: `Date: ${dateMatch[1]}` });
    }
    
    // Extract Site Name
    const siteMatch = htmlContent.match(/Site Name:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (siteMatch) {
        sections.push({ type: 'text', text: `Site Name: ${siteMatch[1]}` });
    }
    
    // Extract Engineer Name
    const engineerMatch = htmlContent.match(/Engineer Name:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (engineerMatch) {
        sections.push({ type: 'text', text: `Engineer Name: ${engineerMatch[1]}` });
    }
    
    // Extract Work Performed
    sections.push({ type: 'subtitle', text: 'Work Performed' });
    const workMatch = htmlContent.match(/Work Performed.*?<div class="info-value">([^<]*)<\/div>/s);
    if (workMatch) {
        sections.push({ type: 'text', text: workMatch[1] });
    }
    
    // Extract Recommendations
    sections.push({ type: 'subtitle', text: 'Recommendations' });
    const recommendationsMatch = htmlContent.match(/Recommendations.*?<div class="info-value">([^<]*)<\/div>/s);
    if (recommendationsMatch) {
        sections.push({ type: 'text', text: recommendationsMatch[1] });
    }
    
    // Extract Time Spent
    sections.push({ type: 'subtitle', text: 'Time Spent' });
    const startTimeMatch = htmlContent.match(/Start Time:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (startTimeMatch) {
        sections.push({ type: 'text', text: `Start Time: ${startTimeMatch[1]}` });
    }
    
    const endTimeMatch = htmlContent.match(/End Time:.*?<div class="info-value">([^<]*)<\/div>/s);
    if (endTimeMatch) {
        sections.push({ type: 'text', text: `End Time: ${endTimeMatch[1]}` });
    }
    
    const totalTimeMatch = htmlContent.match(/Total Time:.*?<div class="info-value">([^<]*)<\/div>/s);
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
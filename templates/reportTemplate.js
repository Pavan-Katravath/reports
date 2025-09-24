/**
 * Generates HTML template for notification reports
 * @param {Object} data - Report data object
 * @returns {string} HTML string
 */
export function generateReportTemplate(data) {
  const {
    title = 'Notification Report',
    timestamp = new Date().toISOString(),
    notifications = [],
    summary = {},
    metadata = {}
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .summary-section {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border-left: 4px solid #667eea;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .summary-item {
            text-align: center;
            padding: 1rem;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .summary-item .number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .summary-item .label {
            font-size: 0.9rem;
            color: #666;
            margin-top: 0.5rem;
        }
        
        .notifications-section {
            margin-bottom: 2rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #667eea;
        }
        
        .notification-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: box-shadow 0.2s ease;
        }
        
        .notification-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .notification-type {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .notification-timestamp {
            color: #666;
            font-size: 0.9rem;
        }
        
        .notification-content {
            margin-bottom: 1rem;
        }
        
        .notification-message {
            font-size: 1rem;
            line-height: 1.5;
        }
        
        .notification-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            font-size: 0.9rem;
            color: #666;
        }
        
        .meta-item {
            display: flex;
            flex-direction: column;
        }
        
        .meta-label {
            font-weight: 500;
            color: #333;
        }
        
        .footer {
            margin-top: 3rem;
            padding: 2rem;
            background: #f8f9fa;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        
        .footer .generated-info {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .footer .service-info {
            font-size: 0.8rem;
            opacity: 0.8;
        }
        
        @media print {
            .header {
                background: #667eea !important;
                -webkit-print-color-adjust: exact;
            }
            
            .notification-item {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .summary-section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">Generated on ${new Date(timestamp).toLocaleString()}</div>
    </div>
    
    <div class="container">
        <div class="summary-section">
            <h2 class="section-title">Report Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="number">${summary.total || notifications.length}</div>
                    <div class="label">Total Notifications</div>
                </div>
                <div class="summary-item">
                    <div class="number">${summary.unread || 0}</div>
                    <div class="label">Unread</div>
                </div>
                <div class="summary-item">
                    <div class="number">${summary.urgent || 0}</div>
                    <div class="label">Urgent</div>
                </div>
                <div class="summary-item">
                    <div class="number">${summary.resolved || 0}</div>
                    <div class="label">Resolved</div>
                </div>
            </div>
        </div>
        
        <div class="notifications-section">
            <h2 class="section-title">Notification Details</h2>
            ${notifications.map(notification => `
                <div class="notification-item">
                    <div class="notification-header">
                        <span class="notification-type">${notification.type || 'General'}</span>
                        <span class="notification-timestamp">${new Date(notification.timestamp || Date.now()).toLocaleString()}</span>
                    </div>
                    <div class="notification-content">
                        <div class="notification-message">${notification.message || 'No message content'}</div>
                    </div>
                    <div class="notification-meta">
                        <div class="meta-item">
                            <span class="meta-label">Priority:</span>
                            <span>${notification.priority || 'Normal'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Status:</span>
                            <span>${notification.status || 'Active'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Source:</span>
                            <span>${notification.source || 'System'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">User:</span>
                            <span>${notification.user || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="footer">
        <div class="generated-info">Report generated by Notification Report Service</div>
        <div class="service-info">Powered by Vercel Serverless Functions</div>
    </div>
</body>
</html>`;
}

/**
 * Generates a simple template for basic reports
 * @param {Object} data - Report data
 * @returns {string} HTML string
 */
export function generateSimpleTemplate(data) {
  const { title = 'Simple Report', content = 'No content provided' } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { line-height: 1.6; }
        .footer { margin-top: 50px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>Generated by Notification Report Service</p>
    </div>
</body>
</html>`;
}
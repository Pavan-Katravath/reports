# Notification Report Service

A serverless notification report generation service built for Vercel, compatible with the collab project's notification.report API. This service generates PDF reports using Puppeteer and can handle DPG, Thermal/Power, and DCPS report types.

## Features

- 🚀 Serverless architecture optimized for Vercel
- 📄 PDF generation using Puppeteer
- 🎨 Customizable HTML templates
- 🔧 Modular design with separate helpers and templates
- 🛡️ Comprehensive error handling
- 🌐 CORS support for cross-origin requests
- 📊 Compatible with collab project's API structure

## Project Structure

```
reports/
├── 📁 .git/                          # Git repository files
├── 📁 .vercel/                       # Vercel deployment configuration
├── 📁 api/
│   └── 📄 notification.report.js     # Main API endpoint
├── 📁 helpers/
│   └── 📄 reportGenerationHelper.js  # Report generation utilities
├── 📁 templates/
│   ├── 📄 reportTemplate.js          # Report template functions
│   └── 📄 dpg.html                   # DPG HTML template
├── 📁 public/
│   └── 📄 index.html                 # Landing page for the API service
├── 📄 .gitignore                     # Git ignore rules
├── 📄 package.json                   # Node.js dependencies and scripts
├── 📄 package-lock.json              # Dependency lock file
├── 📄 README.md                      # Project documentation
└── 📄 vercel.json                    # Vercel deployment configuration
```

## API Endpoints

### POST /api/notification.report

Generates a PDF report based on the provided data.

**Request Body:**
```json
{
  "call_no": "SAMPLE-001",
  "product_group": "dpg",
  "params": {
    "customer_name": "Sample Customer",
    "site_name": "Sample Site",
    "engineer_name": "John Doe",
    "report_date": "2024-01-01",
    "work_performed": "Sample maintenance work performed",
    "recommendations": "Sample recommendations for future maintenance"
  },
  "formdata": {
    "safety_observations": [
      "All safety protocols were followed",
      "Personal protective equipment was used",
      "Work area was properly secured"
    ],
    "work_performed": [
      "System inspection completed",
      "Preventive maintenance performed",
      "Documentation updated"
    ],
    "recommendations": [
      "Schedule next maintenance in 6 months",
      "Monitor system performance",
      "Update maintenance procedures"
    ]
  },
  "engineerSignature": "data:image/png;base64,...",
  "managerSignature": "data:image/png;base64,...",
  "dontSentEmail": false,
  "filename": "custom-report.pdf"
}
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="report.pdf"`
- Body: PDF file buffer

### GET /api/notification.report

Generates a sample PDF report for testing.

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="notification-report.pdf"`
- Body: PDF file buffer

## Supported Product Groups

- **dpg**: DPG Field Service Report
- **air**: Thermal/Power Field Service Report
- **power**: Thermal/Power Field Service Report
- **dcps**: DCPS Field Service Report

## Request Parameters

### Required Parameters

- `call_no`: Unique call number for the report
- `product_group`: Type of report to generate (dpg, air, power, dcps)

### Optional Parameters

- `params`: Object containing report data
  - `customer_name`: Name of the customer
  - `site_name`: Name of the site
  - `engineer_name`: Name of the engineer
  - `report_date`: Date of the report
  - `work_performed`: Description of work performed
  - `recommendations`: Recommendations for future maintenance
- `formdata`: Object containing structured data
  - `safety_observations`: Array of safety observations
  - `work_performed`: Array of work performed items
  - `recommendations`: Array of recommendations
- `engineerSignature`: Base64 encoded signature image
- `managerSignature`: Base64 encoded signature image
- `dontSentEmail`: Boolean flag to skip email sending
- `filename`: Custom filename for the PDF

## Usage Examples

### Generate Sample Report (GET)

```bash
curl -X GET https://your-service.vercel.app/api/notification.report \
  -H "Accept: application/pdf" \
  --output sample-report.pdf
```

### Generate Custom Report (POST)

```bash
curl -X POST https://your-service.vercel.app/api/notification.report \
  -H "Content-Type: application/json" \
  -H "Accept: application/pdf" \
  -d '{
    "call_no": "CALL-001",
    "product_group": "dpg",
    "params": {
      "customer_name": "ABC Company",
      "site_name": "Main Office",
      "engineer_name": "John Smith",
      "report_date": "2024-01-15",
      "work_performed": "System maintenance and inspection",
      "recommendations": "Schedule next maintenance in 6 months"
    },
    "formdata": {
      "safety_observations": [
        "All safety protocols followed",
        "PPE used correctly"
      ],
      "work_performed": [
        "System inspection",
        "Preventive maintenance",
        "Documentation update"
      ],
      "recommendations": [
        "Monitor system performance",
        "Schedule regular maintenance"
      ]
    },
    "filename": "abc-company-report.pdf"
  }' \
  --output custom-report.pdf
```

### JavaScript/Node.js Usage

```javascript
// Generate sample report
const response = await fetch('https://your-service.vercel.app/api/notification.report');
const pdfBuffer = await response.arrayBuffer();

// Generate custom report
const customData = {
  call_no: 'CALL-001',
  product_group: 'dpg',
  params: {
    customer_name: 'ABC Company',
    site_name: 'Main Office',
    engineer_name: 'John Smith',
    report_date: '2024-01-15',
    work_performed: 'System maintenance and inspection',
    recommendations: 'Schedule next maintenance in 6 months'
  },
  formdata: {
    safety_observations: [
      'All safety protocols followed',
      'PPE used correctly'
    ],
    work_performed: [
      'System inspection',
      'Preventive maintenance',
      'Documentation update'
    ],
    recommendations: [
      'Monitor system performance',
      'Schedule regular maintenance'
    ]
  },
  filename: 'abc-company-report.pdf'
};

const response = await fetch('https://your-service.vercel.app/api/notification.report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(customData)
});

const pdfBuffer = await response.arrayBuffer();
```

## Integration with Collab Project

This service is designed to be compatible with the collab project's notification.report API. To integrate:

1. **Deploy this service to Vercel**
2. **Update collab project settings** with the service URL
3. **Use the same API structure** as the collab project

### Collab Integration Example

```javascript
// In your collab project
const reportData = {
  call_no: 'CALL-001',
  product_group: 'dpg',
  params: {
    customer_name: 'Customer Name',
    site_name: 'Site Name',
    engineer_name: 'Engineer Name',
    report_date: new Date().toISOString().split('T')[0],
    work_performed: 'Work performed description',
    recommendations: 'Recommendations'
  },
  formdata: {
    safety_observations: ['Safety observation 1', 'Safety observation 2'],
    work_performed: ['Work item 1', 'Work item 2'],
    recommendations: ['Recommendation 1', 'Recommendation 2']
  }
};

const response = await fetch('https://your-reports-service.vercel.app/api/notification.report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(reportData)
});

const pdfBuffer = await response.arrayBuffer();
```

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd reports
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   # Generate sample report
   curl -X GET http://localhost:3000/api/notification.report --output sample-report.pdf
   
   # Generate custom report
   curl -X POST http://localhost:3000/api/notification.report \
     -H "Content-Type: application/json" \
     -d '{"call_no":"TEST-001","product_group":"dpg"}' \
     --output custom-report.pdf
   ```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables

Set these in your Vercel dashboard:

- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `true`
- `PUPPETEER_EXECUTABLE_PATH`: `/usr/bin/chromium-browser`
- `NODE_ENV`: `production`

## Configuration

### Vercel Configuration (vercel.json)

```json
{
  "version": 2,
  "functions": {
    "api/notification.report.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true",
    "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/chromium-browser"
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success - PDF generated
- `400`: Bad Request - Missing required parameters
- `405`: Method Not Allowed - Unsupported HTTP method
- `500`: Internal Server Error - PDF generation failed

Error responses include JSON with error details:

```json
{
  "error": "Bad request",
  "message": "Report data or call_no is required in request body"
}
```

## Performance Considerations

- **Cold Start**: First request may take longer due to Puppeteer initialization
- **Memory Usage**: Puppeteer requires significant memory (512MB+ recommended)
- **Timeout**: Set to 30 seconds maximum execution time
- **Browser Reuse**: Browser instances are reused when possible

## Security Considerations

- **Input Validation**: All inputs are validated and sanitized
- **CORS Configuration**: Proper CORS headers for cross-origin requests
- **Error Messages**: Sensitive information filtered in production
- **Resource Limits**: Memory and execution time limits enforced

## Troubleshooting

### Common Issues

1. **Browser initialization fails:**
   - Ensure Puppeteer is properly installed
   - Check Chromium executable path
   - Verify system dependencies

2. **PDF generation timeout:**
   - Increase timeout in `vercel.json`
   - Optimize HTML template size
   - Check network connectivity

3. **Memory issues:**
   - Reduce concurrent requests
   - Optimize browser instance reuse
   - Check Vercel function memory limits

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Vercel function logs
- Contact the development team
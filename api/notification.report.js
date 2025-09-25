import { generateDPGReport, generateThermalOrPowerReport, generateDCPSReport, generatePartReturnedAndConsumedTable, generateSafetyTable } from '../templates/reportTemplate.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Function to upload PDF to S3 using credentials from collab project
async function uploadToS3(bufferContent, fileName, s3Credentials, contentType = 'application/pdf') {
	try {
		if (!s3Credentials || !s3Credentials.bucketName || !s3Credentials.accessKeyId || !s3Credentials.secretAccessKey) {
			throw new Error('S3 credentials are required from collab project');
		}

		// Create S3 client with credentials from collab project
		const s3Client = new S3Client({
			region: s3Credentials.region || 'us-east-1',
			credentials: {
				accessKeyId: s3Credentials.accessKeyId,
				secretAccessKey: s3Credentials.secretAccessKey,
			},
		});

		const key = s3Credentials.keyPrefix ? `${s3Credentials.keyPrefix}/${fileName}` : `fsr/${new Date().getFullYear()}/${fileName}`;
		
		const command = new PutObjectCommand({
			Bucket: s3Credentials.bucketName,
			Key: key,
			Body: bufferContent,
			ContentType: contentType,
			ContentDisposition: `attachment; filename="${fileName}"`,
		});

		const result = await s3Client.send(command);
		console.log(`PDF uploaded to S3 successfully: ${key}`);
		
		return {
			success: true,
			key,
			etag: result.ETag,
			url: `https://${s3Credentials.bucketName}.s3.${s3Credentials.region || 'us-east-1'}.amazonaws.com/${key}`,
		};
	} catch (error) {
		console.error('S3 upload error:', error);
		throw new Error(`Failed to upload PDF to S3: ${error.message}`);
	}
}

export default async function handler(req, res) {
	// Set CORS headers for collab project integration
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	
	if (req.method === 'OPTIONS') {
		res.status(200).end();
		return;
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const userAgent = req.headers['user-agent'] || '';
		console.log(`notification.report Request Started at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
		console.log(`Request payload: ${JSON.stringify({ Method: 'POST', payload: req.body })}`);
		
		const param = req.body;
		const paramObj = param.params ? JSON.parse(param.params) : undefined;
		
		// Extract S3 credentials from collab project
		const s3Credentials = param.s3Credentials || param.s3_credentials;
		
		// Mock room data for serverless environment
		const room = {
			name: param.call_no ? param.call_no.toLowerCase() : 'general',
			customFields: {}
		};

		const { issuedEls, returnedEls } = generatePartReturnedAndConsumedTable(param, 3, false);

		// Mock logo for testing - replace with actual logo from collab project
		const logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAD8CAYAAADkDI70AAABgWlDQ1BzUkdCIElFQzYxOTY2LTIuMQAAKJF1kc8rw2Ecx18bmpimOFAOS+NkmpG4OGwxCoeZMly2736pbb59v5OWq3JVlLj4deAv4KqclSJScpQzcWF9fb7bakv2eXo+z+t5P5/Pp+f5PGANpZWMXu+BTDanBQM+50J40Wl7xUInNkYYiii6OjM3EaKmfT1ItNid26xVO+5fa47FdQUsjcJjiqrlhCeFp9dzqsm7wu1KKhITPhfu0+SCwvemHi3xm8nJEv+YrIWCfrC2CjuTVRytYiWlZYTl5bgy6TWlfB/zJfZ4dn5O1m6ZXegECeDDyRTj+BlmgFHxw7jx0i87auR7ivmzrEquIl4lj8YKSVLk6BN1TarHZU2IHpeRJm/2/29f9cSgt1Td7oOGF8P46AHbDhS2DeP72DAKJ1D3DFfZSv7qEYx8ir5d0VyH4NiEi+uKFt2Dyy3oeFIjWqQo1cm0JhLwfgYtYWi7aalUs/K55w+QmhDvuoG9g+gV+Idy7/KAmgT1d6GTAAAAAlwSFlzAAALEwAACxMBAJqcGAAAIABJREFUeJzt3XeYJGXV/vHvBmCJkgQFQQGxERATisALSFwWOCSXLIgioCg/wABmRMH4vhgwgzAsUWBJhxyWaEBMmNA2K0El57Th90fVsLPDzGx3T9Vzqqrvz3Xt5bo7U+eGZbn71PPUcyYgjWJmSwOrAS8b9mN5YAlg8fzHSD9fDHgGeBJ4asiPJ4f9/AHgrmE//uXuj6f4ZxQREREREWmiCdEBpHtmtgywAfDa/H/XYH4jvnRgtEeZ37D/Ffg1cAfwazXvIiIiIiIiY1ODXmFmNgFYk6wRH+yxAfAK6vVnN4+sYb9j6A93/3tkKBERERERkSqpU5PXeHlDvj6wVf5jc2DZ0FDluh+4CZgFzHL3PwTs';

		const finalObject = {
			param,
			room,
			paramObj,
			logo,
			tableHTML: param.product_group.toLowerCase() !== 'dcps' ? generateSafetyTable(paramObj?.formdata) : "",
			returnedEls,
			issuedEls,
		};

		let bufferContent = '';
		
		// Generate PDF using PDFKit based on product group
		switch (param.product_group.toLowerCase()) {
			case 'dpg':
				try {
					bufferContent = await generateDPGReport(finalObject);
				} catch (err) {
					console.log("DPG report generation error:", err);
					// Retry once after a short delay
					await new Promise(resolve => setTimeout(resolve, 1000));
					bufferContent = await generateDPGReport(finalObject);
				}
				break;
		
			case 'air':
			case 'power':
				try {
					bufferContent = await generateThermalOrPowerReport(finalObject);
				} catch (err) {
					console.log("Thermal/Power report generation error:", err);
					await new Promise(resolve => setTimeout(resolve, 1000));
					bufferContent = await generateThermalOrPowerReport(finalObject);
				}
				break;
				
			case 'dcps':
				try {
					bufferContent = await generateDCPSReport(finalObject);
				} catch (err) {
					console.log("DCPS report generation error:", err);
					await new Promise(resolve => setTimeout(resolve, 1000));
					bufferContent = await generateDCPSReport(finalObject);
				}
				break;
		
			default:
				throw new Error('The required "type" param provided does not match any type');
		}

		if (!bufferContent || !bufferContent.length) {
			throw new Error('PDF content is not generated or undefined');
		} else {
			console.log(`PDF content Generated successfully for ${param.product_group} type`);
		}

		// Upload PDF to S3 using credentials from collab project
		const fileName = `${param.call_no || 'report'}.pdf`;
		const uploadResult = await uploadToS3(bufferContent, fileName, s3Credentials);
		
		console.log(`notification.report Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
		console.log(`Response: ${JSON.stringify({ success: true, etag: uploadResult.etag, fileName, path: uploadResult.key, url: uploadResult.url })}`);

		// Return S3 upload information
		res.status(200).json({
			success: true,
			etag: uploadResult.etag,
			fileName,
			path: uploadResult.key,
			url: uploadResult.url,
			message: 'PDF generated and uploaded to S3 successfully'
		});

	} catch (error) {
		console.error('Error generating report:', error);
		res.status(500).json({ 
			error: 'Failed to generate report', 
			message: error.message,
			success: false 
		});
	}
}
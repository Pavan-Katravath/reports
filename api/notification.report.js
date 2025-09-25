import { generateDPGReport, generateThermalOrPowerReport, generateDCPSReport, generatePartReturnedAndConsumedTable, generateSafetyTable } from '../templates/reportTemplate.js';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

// Function to validate S3/MinIO connection
async function validateConnection(s3Client, s3Credentials) {
	try {
		// Try to list buckets to validate connection
		const { ListBucketsCommand } = await import('@aws-sdk/client-s3');
		await s3Client.send(new ListBucketsCommand({}));
		console.log('S3/MinIO connection validated successfully');
		return true;
	} catch (error) {
		console.error('S3/MinIO connection validation failed:', error.message);
		
		// Provide specific error messages based on error type
		if (error.code === 'ECONNREFUSED') {
			const endpoint = s3Credentials.endpoint || s3Credentials.url || 'AWS S3';
			throw new Error(`Cannot connect to ${endpoint}. Please ensure the service is running and accessible.`);
		} else if (error.code === 'ENOTFOUND') {
			throw new Error(`Cannot resolve hostname for ${s3Credentials.endpoint || s3Credentials.url}. Please check the endpoint URL.`);
		} else if (error.code === 'ECONNRESET') {
			throw new Error(`Connection was reset by the server. Please check your credentials and endpoint configuration.`);
		} else if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
			throw new Error(`Invalid credentials. Please check your access key ID and secret access key.`);
		} else {
			throw new Error(`Connection failed: ${error.message}`);
		}
	}
}

// Function to check if bucket exists and create it if needed (for MinIO)
async function ensureBucketExists(s3Client, bucketName, s3Credentials) {
	try {
		// Check if bucket exists
		await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
		console.log(`Bucket ${bucketName} exists`);
		return true;
	} catch (error) {
		if (error.name === 'NoSuchBucket' || error.name === 'NotFound') {
			// Bucket doesn't exist, try to create it (only for MinIO)
			if (s3Credentials.endpoint || s3Credentials.url) {
				try {
					console.log(`Creating bucket ${bucketName} for MinIO...`);
					await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
					console.log(`Bucket ${bucketName} created successfully`);
					return true;
				} catch (createError) {
					console.error(`Failed to create bucket ${bucketName}:`, createError.message);
					throw new Error(`Bucket ${bucketName} does not exist and could not be created: ${createError.message}`);
				}
			} else {
				throw new Error(`Bucket ${bucketName} does not exist. Please create it manually for AWS S3.`);
			}
		} else {
			throw error;
		}
	}
}

// Function to upload PDF to S3 using credentials from collab project
async function uploadToS3(bufferContent, fileName, s3Credentials, contentType = 'application/pdf') {
	try {
		if (!s3Credentials || !s3Credentials.bucketName || !s3Credentials.accessKeyId || !s3Credentials.secretAccessKey) {
			throw new Error('S3 credentials are required from collab project');
		}

		// Create S3 client with credentials from collab project (supports both AWS S3 and MinIO)
		const s3ClientConfig = {
			region: s3Credentials.region || 'us-east-1',
			credentials: {
				accessKeyId: s3Credentials.accessKeyId,
				secretAccessKey: s3Credentials.secretAccessKey,
			},
		};

		// If MinIO endpoint is provided, configure for MinIO
		if (s3Credentials.endpoint || s3Credentials.url) {
			s3ClientConfig.endpoint = s3Credentials.endpoint || s3Credentials.url;
			s3ClientConfig.forcePathStyle = true; // Required for MinIO
			s3ClientConfig.signatureVersion = 'v4';
		}

		const s3Client = new S3Client(s3ClientConfig);

		// Validate connection before proceeding
		await validateConnection(s3Client, s3Credentials);

		// Ensure bucket exists before uploading
		await ensureBucketExists(s3Client, s3Credentials.bucketName, s3Credentials);

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
		
		// Generate appropriate URL based on whether it's MinIO or AWS S3
		let url;
		if (s3Credentials.endpoint || s3Credentials.url) {
			// MinIO URL format
			const endpoint = s3Credentials.endpoint || s3Credentials.url;
			url = `${endpoint}/${s3Credentials.bucketName}/${key}`;
		} else {
			// AWS S3 URL format
			url = `https://${s3Credentials.bucketName}.s3.${s3Credentials.region || 'us-east-1'}.amazonaws.com/${key}`;
		}

		return {
			success: true,
			key,
			etag: result.ETag,
			url,
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
		
		// Extract S3 credentials from collab project - try multiple possible formats
		let s3Credentials = param.s3Credentials || param.s3_credentials || param.s3 || param.aws || param.awsCredentials;
		
		// If credentials are nested in params, try to extract them
		if (!s3Credentials && paramObj) {
			s3Credentials = paramObj.s3Credentials || paramObj.s3_credentials || paramObj.s3 || paramObj.aws || paramObj.awsCredentials;
		}
		
		// Fallback to environment variables if no credentials provided in request
		if (!s3Credentials && (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET)) {
			s3Credentials = {
				bucketName: process.env.AWS_S3_BUCKET,
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				region: process.env.AWS_REGION || 'us-east-1',
				keyPrefix: process.env.AWS_S3_KEY_PREFIX || 'fsr'
			};
			
			// Add MinIO endpoint if provided
			if (process.env.MINIO_ENDPOINT || process.env.MINIO_URL) {
				s3Credentials.endpoint = process.env.MINIO_ENDPOINT || process.env.MINIO_URL;
			}
			
			console.log('Using environment variables for S3/MinIO credentials');
		}
		
		// Debug logging for S3 credentials
		console.log('S3 Credentials Debug:', {
			hasS3Credentials: !!param.s3Credentials,
			hasS3CredentialsAlt: !!param.s3_credentials,
			hasS3: !!param.s3,
			hasAws: !!param.aws,
			hasAwsCredentials: !!param.awsCredentials,
			paramObjKeys: paramObj ? Object.keys(paramObj) : 'no paramObj',
			s3CredentialsKeys: s3Credentials ? Object.keys(s3Credentials) : 'none',
			allParamKeys: Object.keys(param)
		});
		
		// Mock room data for serverless environment
		const room = {
			name: param.call_no ? param.call_no.toLowerCase() : 'general',
			customFields: {}
		};

		const { issuedEls, returnedEls } = generatePartReturnedAndConsumedTable(param, 3, false);

		// Mock logo for testing - replace with actual logo from collab project
		// Using a simple, valid base64 encoded 1x1 transparent PNG
		const logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

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
		
		try {
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
		} catch (uploadError) {
			console.warn('S3 upload failed, returning PDF as base64:', uploadError.message);
			
			// Fallback: return PDF as base64 when S3 is unavailable
			const pdfBase64 = bufferContent.toString('base64');
			
			console.log(`notification.report Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
			console.log(`Response: ${JSON.stringify({ success: true, fileName, pdfBase64: '[base64 data]', message: 'PDF generated successfully (S3 upload failed)' })}`);

			res.status(200).json({
				success: true,
				fileName,
				pdfBase64,
				message: 'PDF generated successfully (S3 upload failed)',
				warning: uploadError.message
			});
		}

	} catch (error) {
		console.error('Error generating report:', error);
		res.status(500).json({ 
			error: 'Failed to generate report', 
			message: error.message,
			success: false 
		});
	}
}
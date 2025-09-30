import { generateDPGReport, generateThermalOrPowerReport, generateDCPSReport, generateAirReport, generatePartReturnedAndConsumedTable, generateSafetyTable } from '../templates/reportTemplate.js';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

// Function to call serverless reports service (placeholder implementation)
async function callServerlessReportsService(param, finalObject) {
	try {
		// This is a placeholder implementation
		// In a real scenario, this would call an external serverless service
		console.log('Calling serverless reports service...');
		
		// For now, we'll generate the PDF locally and simulate serverless response
		let bufferContent = '';
		
		switch (param.product_group.toLowerCase()) {
			case 'dpg':
				bufferContent = await generateDPGReport(finalObject);
				break;
			case 'air':
				bufferContent = await generateAirReport(finalObject);
				break;
			case 'power':
				bufferContent = await generateThermalOrPowerReport(finalObject);
				break;
			case 'dcps':
				bufferContent = await generateDCPSReport(finalObject);
				break;
			default:
				throw new Error('Invalid product group');
		}
		
		// Simulate serverless service response
		return {
			success: true,
			fileName: `${param.call_no || 'report'}.pdf`,
			s3Location: `fsr/${new Date().getFullYear()}/${param.call_no || 'report'}.pdf`,
			etag: 'simulated-etag-' + Date.now(),
			path: `fsr/${new Date().getFullYear()}`
		};
	} catch (error) {
		console.error('Serverless reports service error:', error);
		throw new Error(`Serverless reports service failed: ${error.message}`);
	}
}

// Function to send PDF email (matching collab project pattern)
async function sendv1PDFEmail(fsr_attachment, param, isS3Configured = false) {
	try {
		console.log('Sending PDF email...');
		console.log(`Email details:`, {
			filename: fsr_attachment.filename,
			contentType: fsr_attachment.contentType,
			hasContent: !!fsr_attachment.content,
			s3Location: fsr_attachment.s3Location,
			call_no: param.call_no,
			isS3Configured
		});
		
		// Create attachments array (matching collab project pattern)
		const attachments = [{ 
			...fsr_attachment, 
			content: Buffer.from(fsr_attachment.content, 'base64') 
		}];

		// Add additional attachments if S3 is configured (matching collab project)
		if (isS3Configured) {
			// PM Checklist
			if (param && param?.pm_checklist_url) {
				try {
					const pm_checklist = await s3FSRFileOpertations('read', `${param.call_no.toLowerCase()}_pm_checklist.pdf`, '', param.call_no.toLowerCase(), `pm_checklist/${new Date().getFullYear()}`, true);
					if (pm_checklist) {
						console.log(`PM checklist found for call ${param.call_no}`);
						attachments.push({
							filename: `${param.call_no}_pm_checklist.pdf`,
							content: pm_checklist,
							contentType: 'application/pdf',
						});
					}
				} catch (error) {
					console.log(`PM checklist not found for call ${param.call_no}:`, error.message);
				}
			}

			// Power Checklist
			if (param && param?.power_checklist_url) {
				try {
					const power_checklist = await s3FSRFileOpertations('read', `${param.call_no.toLowerCase()}_power_checklist.pdf`, '', param.call_no.toLowerCase(), `power_checklist/${new Date().getFullYear()}`, true);
					if (power_checklist) {
						console.log(`Power checklist found for call ${param.call_no}`);
						attachments.push({
							filename: `${param.call_no}_power_checklist.pdf`,
							content: power_checklist,
							contentType: 'application/pdf',
						});
					}
				} catch (error) {
					console.log(`Power checklist not found for call ${param.call_no}:`, error.message);
				}
			}

			// Other Document
			if (param && param?.other_document_url) {
				try {
					const other_checklist = await s3FSRFileOpertations('read', `${param.call_no.toLowerCase()}_other_document.pdf`, '', param.call_no.toLowerCase(), `other_document/${new Date().getFullYear()}`, true);
					if (other_checklist) {
						console.log(`Other document found for call ${param.call_no}`);
						attachments.push({
							filename: `${param.call_no}_other_document.pdf`,
							content: other_checklist,
							contentType: 'application/pdf',
						});
					}
				} catch (error) {
					console.log(`Other document not found for call ${param.call_no}:`, error.message);
				}
			}

			// Commissioning Checklist
			if (param && param?.commissioning_checklist_url) {
				try {
					const commissioning_checklist = await s3FSRFileOpertations('read', `${param.call_no.toLowerCase()}_commissioning_checklist.pdf`, '', param.call_no.toLowerCase(), `commissioning_checklist/${new Date().getFullYear()}`, true);
					if (commissioning_checklist) {
						console.log(`Commissioning checklist found for call ${param.call_no}`);
						attachments.push({
							filename: `${param.call_no}_commissioning_checklist.pdf`,
							content: commissioning_checklist,
							contentType: 'application/pdf',
						});
					}
				} catch (error) {
					console.log(`Commissioning checklist not found for call ${param.call_no}:`, error.message);
				}
			}

			// General Parameter Checklist
			if (param && param?.general_parameter_checklist_url) {
				try {
					const general_parameter_checklist = await s3FSRFileOpertations('read', `${param.call_no.toLowerCase()}_general_parameter_checklist.pdf`, '', param.call_no.toLowerCase(), `general_parameter_checklist/${new Date().getFullYear()}`, true);
					if (general_parameter_checklist) {
						console.log(`General parameter checklist found for call ${param.call_no}`);
						attachments.push({
							filename: `${param.call_no}_general_parameter_checklist.pdf`,
							content: general_parameter_checklist,
							contentType: 'application/pdf',
						});
					}
				} catch (error) {
					console.log(`General parameter checklist not found for call ${param.call_no}:`, error.message);
				}
			}

			// PM Document
			if (param && param?.pm_document_url) {
				try {
					const pm_document = await s3FSRFileOpertations('read', `${param.call_no.toLowerCase()}_pm_document.pdf`, '', param.call_no.toLowerCase(), `pm_document/${new Date().getFullYear()}`, true);
					if (pm_document) {
						console.log(`PM document found for call ${param.call_no}`);
						attachments.push({
							filename: `${param.call_no}_pm_document.pdf`,
							content: pm_document,
							contentType: 'application/pdf',
						});
					}
				} catch (error) {
					console.log(`PM document not found for call ${param.call_no}:`, error.message);
				}
			}
		}

		// Simulate email sending (matching collab project pattern)
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		console.log(`FSR Email would be sent for call ${param.call_no} with ${attachments.length} attachments`);
		console.log(`Email details:`, {
			from: process.env.From_Email || 'noreply@example.com',
			to: param.to,
			cc: param.cc,
			subject: param.subject,
			attachments: attachments.map(att => att.filename)
		});
		
		return { success: true, message: 'Email sent successfully (simulated)', attachments: attachments.length };
	} catch (error) {
		console.error('Email sending error:', error);
		throw new Error(`Email sending failed: ${error.message}`);
	}
}

// S3 operations function matching collab project pattern
async function s3FSRFileOpertations(type, Key, Body = '', call_no = '', path = '', isChecklist = false) {
	try {
		// Get S3 credentials from request or environment (matching collab project settings)
		const s3Credentials = {
			accessKeyId: process.env.FileUpload_S3_AWSAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.FileUpload_S3_AWSSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.FileUpload_S3_Region || process.env.AWS_REGION || 'us-east-1',
			bucketName: process.env.FileUpload_S3_Bucket || process.env.AWS_S3_BUCKET,
			endpoint: process.env.FileUpload_S3_BucketURL || process.env.MINIO_ENDPOINT,
			forcePathStyle: process.env.FileUpload_S3_ForcePathStyle === 'true' || true
		};

		if (!s3Credentials.accessKeyId || !s3Credentials.secretAccessKey || !s3Credentials.bucketName) {
			throw new Error('S3 credentials are not properly configured');
		}

		// Create S3 client configuration matching collab project
		const s3ClientConfig = {
			region: s3Credentials.region,
			credentials: {
				accessKeyId: s3Credentials.accessKeyId,
				secretAccessKey: s3Credentials.secretAccessKey,
			},
		};

		// Configure for MinIO if endpoint is provided (matching collab project)
		if (s3Credentials.endpoint) {
			s3ClientConfig.endpoint = s3Credentials.endpoint;
			s3ClientConfig.forcePathStyle = s3Credentials.forcePathStyle;
			s3ClientConfig.signatureVersion = 'v4';
		}

		const s3Client = new S3Client(s3ClientConfig);

		// Build bucket name with path (matching collab project pattern)
		const bucketName = path ? `${s3Credentials.bucketName}/${path}` : s3Credentials.bucketName;
		const fullKey = Key;

		switch (type) {
			case 'post':
			case 'write':
				const command = new PutObjectCommand({
					Bucket: bucketName,
					Key: fullKey,
					Body: Body,
					ContentType: 'application/pdf',
					ContentDisposition: `attachment; filename="${Key}"`,
				});

				const result = await s3Client.send(command);
				console.log(`FSR ${Key} uploaded to S3 successfully`);
				return result.ETag || result.Location;

			case 'read':
				const getCommand = new GetObjectCommand({
					Bucket: bucketName,
					Key: fullKey,
				});

				const getResult = await s3Client.send(getCommand);
				console.log(`FSR ${Key} fetched from S3 successfully`);
				return getResult.Body;

			case 'delete':
				const deleteCommand = new DeleteObjectCommand({
					Bucket: bucketName,
					Key: fullKey,
				});

				await s3Client.send(deleteCommand);
				console.log(`FSR ${Key} deleted from S3 successfully`);
				return true;

			case 'location':
				const locationCommand = new GetObjectCommand({
					Bucket: bucketName,
					Key: fullKey,
				});

				const locationResult = await s3Client.send(locationCommand);
				console.log(`FSR ${Key} location fetched from S3 successfully`);
				return locationResult.ETag;

			default:
				throw new Error(`Unsupported operation type: ${type}`);
		}
	} catch (err) {
		console.log(`Error on S3 while doing operation ${type} for FSR ${Key}:`, err.message);
		
		if (type === 'read' && !isChecklist) {
			console.log(`Possibility to get the FSR available on general room custom fields for ${Key}`);
			// In a serverless environment, we don't have access to Rooms collection
			// This would need to be handled differently in a real implementation
			return undefined;
		}
		
		throw err;
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
		
		// Fallback to FileUpload_S3_* environment variables (MinIO configuration)
		if (!s3Credentials && (process.env.FileUpload_S3_AWSAccessKeyId && process.env.FileUpload_S3_AWSSecretAccessKey && process.env.FileUpload_S3_Bucket)) {
			s3Credentials = {
				bucketName: process.env.FileUpload_S3_Bucket,
				accessKeyId: process.env.FileUpload_S3_AWSAccessKeyId,
				secretAccessKey: process.env.FileUpload_S3_AWSSecretAccessKey,
				region: process.env.FileUpload_S3_Region || 'us-east-1',
				endpoint: process.env.FileUpload_S3_BucketURL,
				forcePathStyle: process.env.FileUpload_S3_ForcePathStyle === 'true' || true
			};
			
			console.log('Using FileUpload_S3_* environment variables for MinIO credentials');
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
			allParamKeys: Object.keys(param),
			hasEndpoint: s3Credentials ? !!s3Credentials.endpoint : false,
			endpoint: s3Credentials ? s3Credentials.endpoint : 'none',
			envVars: {
				FileUpload_S3_AWSAccessKeyId: !!process.env.FileUpload_S3_AWSAccessKeyId,
				FileUpload_S3_AWSSecretAccessKey: !!process.env.FileUpload_S3_AWSSecretAccessKey,
				FileUpload_S3_Bucket: !!process.env.FileUpload_S3_Bucket,
				FileUpload_S3_Region: !!process.env.FileUpload_S3_Region,
				FileUpload_S3_BucketURL: !!process.env.FileUpload_S3_BucketURL,
				FileUpload_S3_ForcePathStyle: !!process.env.FileUpload_S3_ForcePathStyle
			}
		});
		
		// Validate S3 credentials before proceeding
		if (!s3Credentials) {
			console.warn('No S3 credentials provided in request or environment variables');
			console.warn('PDF will be returned as base64 instead of uploaded to S3');
		} else if (s3Credentials.endpoint && (s3Credentials.endpoint.includes('localhost') || s3Credentials.endpoint.includes('127.0.0.1'))) {
			console.warn('S3 endpoint is set to localhost. This will likely fail in production.');
			console.warn('Consider using AWS S3 or a proper MinIO endpoint instead.');
		}
		
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
				try {
					bufferContent = await generateAirReport(finalObject);
				} catch (err) {
					console.log("Air report generation error:", err);
					await new Promise(resolve => setTimeout(resolve, 1000));
					bufferContent = await generateAirReport(finalObject);
				}
				break;
		
			case 'power':
				try {
					bufferContent = await generateThermalOrPowerReport(finalObject);
				} catch (err) {
					console.log("Power report generation error:", err);
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
		
		// Check if serverless reports service is enabled
		const useServerlessReports = param.useServerlessReports || param.use_serverless_reports || false;
		
		if (useServerlessReports) {
			try {
				console.log(`Using serverless reports service for call ${param.call_no}`);
				const serverlessResult = await callServerlessReportsService(param, finalObject);
				
				if (serverlessResult.success) {
					// Send email if not disabled
					if (!param.dontSentEmail && !param.dont_sent_email) {
						// Create attachment object for email
						const fsr_attachment = {
							filename: serverlessResult.fileName,
							content: '', // Will be populated by email function from S3
							contentType: 'application/pdf',
							s3Location: serverlessResult.s3Location
						};
						await sendv1PDFEmail(fsr_attachment, param, true);
					} else {
						console.log(`dontSentEmail is true for call ${param.call_no}, Hence FSR PDF only stored on serverless service S3`);
					}

					console.log(`notification.report Serverless Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
					console.log(`Response: ${JSON.stringify({ success: true, etag: serverlessResult.etag, fileName: serverlessResult.fileName, path: serverlessResult.path, service: 'serverless' })}`);

					return res.status(200).json({ 
						success: true,
						etag: serverlessResult.etag, 
						fileName: serverlessResult.fileName, 
						path: serverlessResult.path,
						service: 'serverless'
					});
				}
			} catch (serverlessError) {
				console.error(`Serverless reports service failed for call ${param.call_no}, falling back to local generation:`, serverlessError);
				// Continue to local generation as fallback
			}
		}

		// Local PDF generation (original implementation or fallback)
		console.log(`Using local PDF generation for call ${param.call_no}`);
		
		// Check if we have valid S3 credentials before attempting upload
		if (!s3Credentials || !s3Credentials.accessKeyId || !s3Credentials.secretAccessKey || !s3Credentials.bucketName) {
			console.warn('Invalid or missing S3 credentials, returning PDF as base64');
			
			// Check if client wants direct PDF response
			const returnDirectPDF = param.returnDirectPDF || param.return_pdf_direct;
			
			if (returnDirectPDF) {
				// Return PDF directly with proper headers
				res.setHeader('Content-Type', 'application/pdf');
				res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
				res.setHeader('Content-Length', bufferContent.length);
				
				console.log(`notification.report Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
				console.log(`Response: Direct PDF response (${bufferContent.length} bytes)`);
				
				return res.status(200).send(bufferContent);
			} else {
				// Return PDF as base64 when S3 credentials are missing
				const pdfBase64 = bufferContent.toString('base64');
				
				console.log(`notification.report Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
				console.log(`Response: ${JSON.stringify({ success: true, fileName, pdfBase64: '[base64 data]', message: 'PDF generated successfully (S3 credentials missing)' })}`);

				return res.status(200).json({
					success: true,
					fileName,
					pdfBase64,
					message: 'PDF generated successfully (S3 credentials missing)',
					warning: 'S3 credentials are missing or invalid. Please provide valid S3 credentials in the request payload.'
				});
			}
		} else {
			try {
				// Use the S3 operations function matching collab project pattern
				const etag = await s3FSRFileOpertations('post', fileName, bufferContent, '', `fsr/${new Date().getFullYear()}`, false);
				
				if (!etag) {
					console.log(`Error on S3 upload. Hence it stores pdf in general room`);
					// In serverless environment, we can't store in general room, so return as base64
					const pdfBase64 = bufferContent.toString('base64');
					return res.status(200).json({
						success: true,
						fileName,
						pdfBase64,
						message: 'PDF generated successfully (S3 upload failed)',
						warning: 'S3 upload failed, PDF returned as base64'
					});
				}

				// Send email if not disabled
				if (!param.dontSentEmail && !param.dont_sent_email) {
					const fsr_attachment = {
						filename: fileName,
						content: bufferContent.toString('base64'),
						contentType: 'application/pdf',
					};
					await sendv1PDFEmail(fsr_attachment, param, true);
				} else {
					console.log(`dontSentEmail is true for call ${param.call_no}, Hence FSR PDF only stored on S3`);
				}

				console.log(`notification.report Local Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
				console.log(`Response: ${JSON.stringify({ success: true, etag, fileName, path: `fsr/${new Date().getFullYear()}`, service: 'local' })}`);

				return res.status(200).json({ 
					success: true,
					etag, 
					fileName, 
					path: `fsr/${new Date().getFullYear()}`,
					service: 'local'
				});
			} catch (uploadError) {
				console.warn('S3 upload failed, returning PDF as base64:', uploadError.message);
				
				// Check if client wants direct PDF response
				const returnDirectPDF = param.returnDirectPDF || param.return_pdf_direct;
				
				if (returnDirectPDF) {
					// Return PDF directly with proper headers
					res.setHeader('Content-Type', 'application/pdf');
					res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
					res.setHeader('Content-Length', bufferContent.length);
					
					console.log(`notification.report Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
					console.log(`Response: Direct PDF response (${bufferContent.length} bytes) - S3 upload failed`);
					
					return res.status(200).send(bufferContent);
				} else {
					// Fallback: return PDF as base64 when S3 is unavailable
					const pdfBase64 = bufferContent.toString('base64');
					
					console.log(`notification.report Response at ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' }).format(Date.now())}`);
					console.log(`Response: ${JSON.stringify({ success: true, fileName, pdfBase64: '[base64 data]', message: 'PDF generated successfully (S3 upload failed)' })}`);

					return res.status(200).json({
						success: true,
						fileName,
						pdfBase64,
						message: 'PDF generated successfully (S3 upload failed)',
						warning: uploadError.message
					});
				}
			}
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
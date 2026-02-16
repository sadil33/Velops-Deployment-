const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request Logger Middleware (Top Priority)
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  console.log('[Headers]', JSON.stringify(req.headers));
  next();
});

// Enable CORS for all routes (configured for development flexibility)
// In production, you would restrict this to your frontend domain.
app.use(cors({
  origin: [
    'https://velops-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-infor-logicalidprefix']
}));

// Process Crash Handlers
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  console.error(err.stack);
  // Keep process alive for a moment to flush logs if possible, but usually best to exit.
  // For debugging connection closed, we want to see this log.
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(express.json());

// Root Route for Health Check
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// CSP GenAI Check Endpoint
app.post('/api/csp/genai/check', async (req, res) => {
  const { tenantUrl, token } = req.body;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const targetUrl = `${cleanTenantUrl}/GENAI/chatsvc/api/v1/prompt`;

    console.log(`[CSP GenAI Check] Checking provisioning at: ${targetUrl}`);

    const response = await axios.post(targetUrl, {
      config: {
        temperature: 1
      },
      prompt: "Hello World"
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-infor-logicalidprefix': 'lid://infor.colemanddp'
      },
      validateStatus: function (status) {
        return status < 500; // Resolve even if 4xx to handle "not provisioned" gracefully if it returns 404/403
      }
    });

    console.log(`[CSP GenAI Check] Status: ${response.status}`);

    // We consider it provisioned if we get a 200 OK
    const isProvisioned = response.status === 200;

    res.json({
      isProvisioned,
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('[CSP GenAI Check Error]', error.message);
    // If network error or other issues, assume not provisioned or error
    res.status(500).json({
      isProvisioned: false,
      error: error.message
    });
  }
});

// CSP Ion-Services Check Endpoint
app.post('/api/csp/ion/check', async (req, res) => {
  const { tenantUrl, token } = req.body;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const targetUrl = `${cleanTenantUrl}/IONSERVICES/api/ion/messaging/service/ping`;

    console.log(`[CSP Ion Check] Checking provisioning at: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log(`[CSP Ion Check] Status: ${response.status}`);

    // Provisioned if 200 OK
    const isProvisioned = response.status === 200;

    res.json({
      isProvisioned,
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('[CSP Ion Check Error]', error.message);
    res.status(500).json({
      isProvisioned: false,
      error: error.message
    });
  }
});

// CSP Data-Fabric Check Endpoint
app.post('/api/csp/datafabric/check', async (req, res) => {
  const { tenantUrl, token } = req.body;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const targetUrl = `${cleanTenantUrl}/DATAFABRIC/datalake/v2/ping`;

    console.log(`[CSP Data-Fabric Check] Checking provisioning at: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log(`[CSP Data-Fabric Check] Status: ${response.status}`);

    // Provisioned if 200 OK
    const isProvisioned = response.status === 200;

    res.json({
      isProvisioned,
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('[CSP Data-Fabric Check Error]', error.message);
    res.status(500).json({
      isProvisioned: false,
      error: error.message
    });
  }
});

// CSP Infor-AI Check Endpoint
app.post('/api/csp/inforai/check', async (req, res) => {
  const { tenantUrl, token } = req.body;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const targetUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/version`;

    console.log(`[CSP Infor-AI Check] Checking provisioning at: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log(`[CSP Infor-AI Check] Status: ${response.status}`);

    // Provisioned if 200 OK
    const isProvisioned = response.status === 200;

    res.json({
      isProvisioned,
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('[CSP Infor-AI Check Error]', error.message);
    res.status(500).json({
      isProvisioned: false,
      error: error.message
    });
  }
});

// Proxy Endpoint
app.post('/api/auth/token', async (req, res) => {
  const { clientId, clientSecret, code, redirectUri, tokenUrl } = req.body;

  if (!clientId || !clientSecret || !code || !redirectUri || !tokenUrl) {
    console.error('[Auth] Missing required parameters:', { clientId: !!clientId, clientSecret: !!clientSecret, code: !!code, redirectUri: !!redirectUri, tokenUrl: !!tokenUrl });
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    console.log(`[Auth] Exchanging code for token at: ${tokenUrl}`);

    // Basic Auth Header
    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Form Data Body
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('[Auth] Token exchange successful');
    res.json(response.data);

  } catch (error) {
    console.error('[Auth Error]', error.message);
    if (error.response) {
      console.error('[Auth Error Data]', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Token exchange failed: ' + error.message });
    }
  }
});

// Proxy Endpoint
app.post('/api/proxy', async (req, res) => {
  const { tenantUrl, endpoint, token, method = 'GET', data = {} } = req.body;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  // Sanitize token: Remove "Bearer " if present (case-insensitive) to prevent duplication
  const cleanToken = token.replace(/^Bearer\s+/i, '');

  console.log(`[Proxy] Token received (length: ${token.length}). Using sanitized token.`);

  // Construct the full URL
  // Ensure tenantUrl doesn't have a trailing slash if endpoint starts with one, or vice versa.
  // Although the user provided URL has a trailing slash and endpoint doesn't, we'll be safe.
  const cleanTenantUrl = tenantUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint ? endpoint.replace(/^\//, '') : '';
  const fullUrl = cleanEndpoint ? `${cleanTenantUrl}/${cleanEndpoint}` : cleanTenantUrl;

  console.log(`[Proxy] Forwarding ${method} request to: ${fullUrl}`);

  try {
    const response = await axios({
      method: method,
      url: fullUrl,
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        // Add any other necessary headers here
      },
      data: Object.keys(data).length > 0 ? data : undefined,
    });

    // Send back the data from the tenant API
    res.json(response.data);
  } catch (error) {
    console.error('[Proxy Error]', error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(504).json({ error: 'No response received from tenant API' });
    } else {
      // Something happened in setting up the request
      res.status(500).json({ error: 'Error setting up request: ' + error.message });
    }
  }
});

// File Upload & Parsing Endpoint
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { extractText } = require('./services/fileParser');
const { extractRolesFromText } = require('./services/roleExtractor'); // Legacy regex extractor
const { extractDataWithGemini, setDocumentContext, chatWithDocument } = require('./services/geminiService'); // New AI extractor


app.post('/api/parse', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log(`[Parse] Processing file: ${req.file.originalname}`);
    console.log(`[Parse] MimeType: ${req.file.mimetype}`);

    // Extract text from the file (OCR or Text)
    const text = await extractText(req.file);
    console.log(`[Parse] Extracted text length: ${text.length} chars.`);

    // Set context for potential chat later
    setDocumentContext(text);

    let roles = [];

    // Conditional Logic: TXT vs Others
    if (req.file.mimetype === 'text/plain') {
      console.log('[Parse] Method: Legacy Regex (TXT file)');
      roles = extractRolesFromText(text);
    } else {
      console.log('[Parse] Method: Gemini AI (Document/Image)');
      roles = await extractDataWithGemini(text);
    }

    console.log(`[Parse] Extracted ${roles.length} roles.`);
    res.json({ roles });
  } catch (error) {
    console.error('[Parse Error]', error.message);

    // Check if it's a Gemini error
    if (error.message.includes('Extraction failed') || error.message.includes('generative ai failed') || error.message.includes('GoogleGenerativeAI') || error.message.includes('Failed to extract')) {
      return res.status(500).json({ error: "Extraction failed in genai" });
    }

    res.status(500).json({ error: error.message });
  }
});

// Chat with Document Endpoint
// Chat with Document Endpoint
app.post('/api/chat', async (req, res) => {
  const { question, token, tenantUrl } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Basic validation for auth
  if (!token || !tenantUrl) {
    return res.status(400).json({ error: 'Missing authentication (token/tenantUrl)' });
  }

  try {
    console.log(`[Chat] Question: ${question}`);
    console.log(`[Chat] Using Tenant: ${tenantUrl}`);

    const answer = await chatWithDocument(question, token, tenantUrl);
    res.json({ answer });
  } catch (error) {
    console.error('[Chat Error]', error.message);
    const code = error.message.includes("No document context") ? 400 : 500;
    res.status(code).json({ error: error.message });
  }
});

// ION Python Libraries Deployment Endpoint

app.post('/api/ion-libraries', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Libraries] Processing file: ${req.file.originalname}`);

    // Read file content as text (JSON)
    const fileContent = req.file.buffer.toString('utf-8');

    // Parse JSON to validate
    let libraryPayload;
    try {
      libraryPayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file: ' + parseError.message });
    }

    // Make request to ION Scripting Libraries API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/scriptingservice/model/v1/libraries`;
    console.log(`[ION Libraries] Sending to: ${ionUrl}`);

    const response = await axios.post(ionUrl, libraryPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Libraries] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Libraries Error]', error.message);
    console.error('[ION Libraries Error Details]', error.response?.data || error);
    console.error('[ION Libraries Stack]', error.stack);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// ION Python Scripts Deployment Endpoint
app.post('/api/ion-scripts', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Scripts] Processing file: ${req.file.originalname}`);

    // Read file content as text (JSON)
    const fileContent = req.file.buffer.toString('utf-8');

    // Parse JSON to validate
    let scriptPayload;
    try {
      scriptPayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file: ' + parseError.message });
    }

    // Make request to ION Scripting API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/scriptingservice/model/v1/scripts`;
    console.log(`[ION Scripts] Sending to: ${ionUrl}`);

    const response = await axios.post(ionUrl, scriptPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Scripts] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Scripts Error]', error.message);
    console.error('[ION Scripts Error Details]', error.response?.data || error);
    console.error('[ION Scripts Stack]', error.stack);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// ION Dataflows Deployment Endpoint
app.post('/api/ion-dataflows', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Dataflows] Processing file: ${req.file.originalname}`);

    // Read file content as text (JSON)
    const fileContent = req.file.buffer.toString('utf-8');

    // Parse JSON to validate
    let dataflowPayload;
    try {
      dataflowPayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file: ' + parseError.message });
    }

    // Make request to ION Dataflows API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/connect/model/v1/dataflows`;
    console.log(`[ION Dataflows] Sending to: ${ionUrl}`);

    const response = await axios.post(ionUrl, dataflowPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Dataflows] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Dataflows Error]', error.message);
    console.error('[ION Dataflows Error Details]', error.response?.data || error);
    console.error('[ION Dataflows Stack]', error.stack);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// ION Connection Points Deployment Endpoint
app.post('/api/ion-connectionpoints', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Connection Points] Processing file: ${req.file.originalname}`);

    // Read file content as text (JSON)
    const fileContent = req.file.buffer.toString('utf-8');

    // Parse JSON to validate
    let connectionPointPayload;
    try {
      connectionPointPayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file: ' + parseError.message });
    }

    // Make request to ION Connection Points API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/connect/model/v1/connectionpoints`;
    console.log(`[ION Connection Points] Sending to: ${ionUrl}`);

    const response = await axios.post(ionUrl, connectionPointPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Connection Points] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Connection Points Error]', error.message);
    console.error('[ION Connection Points Error Details]', error.response?.data || error);
    console.error('[ION Connection Points Stack]', error.stack);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// ION Business Rules Deployment Endpoint
app.post('/api/ion-businessrules', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Business Rules] Processing file: ${req.file.originalname}`);

    // Read file content as text (JSON)
    const fileContent = req.file.buffer.toString('utf-8');

    // Parse JSON to validate
    let businessRulePayload;
    try {
      businessRulePayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file: ' + parseError.message });
    }

    // Make request to ION Business Rules API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/process/model/v1/businessrules`;
    console.log(`[ION Business Rules] Sending to: ${ionUrl}`);

    const response = await axios.post(ionUrl, businessRulePayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Business Rules] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Business Rules Error]', error.message);
    console.error('[ION Business Rules Error Details]', error.response?.data || error);
    console.error('[ION Business Rules Stack]', error.stack);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// ION Business Rules Approve Endpoint
app.post('/api/ion-businessrules-approve', async (req, res) => {
  const { rules } = req.body;
  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return res.status(400).json({ error: 'Rules array is required' });
  }

  try {
    console.log(`[ION Business Rules Approve] Processing rules:`, rules);

    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const results = [];

    // Process each rule: first submit, then approve
    for (const ruleName of rules) {
      try {
        // Step 1: Submit the business rule
        const submitUrl = `${cleanTenantUrl}/IONSERVICES/process/model/v1/businessrules/submit?name=${encodeURIComponent(ruleName)}`;
        console.log(`[ION Business Rules Approve] Submitting: ${submitUrl}`);

        await axios.put(submitUrl, null, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Step 2: Approve the business rule
        const approveUrl = `${cleanTenantUrl}/IONSERVICES/process/model/v1/businessrules/approve?name=${encodeURIComponent(ruleName)}`;
        console.log(`[ION Business Rules Approve] Approving: ${approveUrl}`);

        await axios.put(approveUrl, null, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          ruleName,
          status: 'success',
          message: 'Submitted and approved successfully'
        });
        console.log(`[ION Business Rules Approve] Success for: ${ruleName}`);
      } catch (error) {
        results.push({
          ruleName,
          status: 'error',
          message: error.response?.data?.message || error.message
        });
        console.error(`[ION Business Rules Approve Error] For ${ruleName}:`, error.message);
      }
    }

    res.json({
      success: results.every(r => r.status === 'success'),
      results
    });

  } catch (error) {
    console.error('[ION Business Rules Approve Error]', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// ION Workflows Activate Endpoint
app.post('/api/ion-workflows-activate', async (req, res) => {
  const { workflows } = req.body;
  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
    return res.status(400).json({ error: 'Workflows array is required' });
  }

  try {
    console.log(`[ION Workflows Activate] Processing workflows:`, workflows);

    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const results = [];

    // Activate each workflow
    for (const workflowName of workflows) {
      try {
        const activateUrl = `${cleanTenantUrl}/IONSERVICES/process/model/v1/workflows/${workflowName}/activate`;
        console.log(`[ION Workflows Activate] Activating: ${activateUrl}`);

        // User confirmed method is PUT
        await axios.put(activateUrl, null, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          workflowName,
          status: 'success',
          message: 'Activated successfully'
        });
        console.log(`[ION Workflows Activate] Success for: ${workflowName}`);
      } catch (error) {
        results.push({
          workflowName,
          status: 'error',
          message: error.response?.data?.message || error.message
        });
        console.error(`[ION Workflows Activate Error] For ${workflowName}:`, error.message);
      }
    }

    res.json({
      success: results.every(r => r.status === 'success'),
      results
    });

  } catch (error) {
    console.error('[ION Workflows Activate Error]', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// ION Dataflows Activate Endpoint
app.post('/api/ion-dataflows-activate', async (req, res) => {
  const { dataflows } = req.body;
  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  if (!dataflows || !Array.isArray(dataflows) || dataflows.length === 0) {
    return res.status(400).json({ error: 'Dataflows array is required' });
  }

  try {
    console.log(`[ION Dataflows Activate] Processing dataflows:`, dataflows);

    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const results = [];

    // Activate each dataflow
    for (const dataflowName of dataflows) {
      try {
        const activateUrl = `${cleanTenantUrl}/IONSERVICES/connect/model/v1/dataflows/${dataflowName}/activate`;
        console.log(`[ION Dataflows Activate] Activating: ${activateUrl}`);

        await axios.put(activateUrl, null, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          dataflowName,
          status: 'success',
          message: 'Activated successfully'
        });
        console.log(`[ION Dataflows Activate] Success for: ${dataflowName}`);
      } catch (error) {
        results.push({
          dataflowName,
          status: 'error',
          message: error.response?.data?.message || error.message
        });
        console.error(`[ION Dataflows Activate Error] For ${dataflowName}:`, error.message);
      }
    }

    res.json({
      success: results.every(r => r.status === 'success'),
      results
    });

  } catch (error) {
    console.error('[ION Dataflows Activate Error]', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// ION Scripts Approve Endpoint
app.put('/api/ion-scripts-approve', async (req, res) => {
  const scripts = req.body;  // Body is now the array directly
  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
    return res.status(400).json({ error: 'Scripts array is required' });
  }

  try {
    console.log(`[ION Scripts Approve] Approving scripts:`, scripts);

    // Make request to ION Scripts Approve API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/scriptingservice/model/v1/scripts/approve`;
    console.log(`[ION Scripts Approve] Sending to: ${ionUrl}`);

    const response = await axios.put(ionUrl, scripts, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Scripts Approve] Success for: ${scripts.join(', ')}`);
    res.json({
      success: true,
      scripts: scripts,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Scripts Approve Error]', error.message);
    console.error('[ION Scripts Approve Error Details]', error.response?.data || error);
    console.error('[ION Scripts Approve Stack]', error.stack);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});



// IDM Deployment Endpoint
app.post('/api/idm-deploy', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token, version, model, fileType, entityName } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[IDM Deploy] Processing file: ${req.file.originalname}`);

    // Convert file buffer to base64
    const base64Content = req.file.buffer.toString('base64');

    // Construct the IDM API payload
    const payload = {
      item: {
        attrs: {
          attr: [
            {
              name: "version",
              value: version || "claude-3-7-sonnet-20250219-v1:0"
            },
            {
              name: "model",
              value: model || "CLAUDE"
            },
            {
              name: "FileType",
              value: fileType || "-"
            }
          ]
        },
        resrs: {
          res: [
            {
              filename: req.file.originalname,
              base64: base64Content
            }
          ]
        },
        acl: {
          name: "Public"
        },
        entityName: entityName || "GenAIPromptTest"
      }
    };

    // Make request to IDM API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const idmUrl = `${cleanTenantUrl}/IDM/api/items`;
    console.log(`[IDM Deploy] Sending to: ${idmUrl}`);

    const response = await axios.post(idmUrl, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[IDM Deploy] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[IDM Deploy Error]', error.message);
    res.status(500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// ION Workflow Deployment Endpoint
app.post('/api/ion-workflow', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Workflow] Processing file: ${req.file.originalname}`);

    // Read file content as text (JSON)
    const fileContent = req.file.buffer.toString('utf-8');

    // Parse JSON to validate
    let workflowPayload;
    try {
      workflowPayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file: ' + parseError.message });
    }

    // Make request to ION Workflows API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const ionUrl = `${cleanTenantUrl}/IONSERVICES/process/model/v1/workflows`;
    console.log(`[ION Workflow] Sending to: ${ionUrl}`);

    const response = await axios.post(ionUrl, workflowPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ION Workflow] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Workflow Error]', error.message);
    res.status(500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// ION Data Lake Jobs Endpoint
app.post('/api/ion-datalake-jobs', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Data Lake] Processing file: ${req.file.originalname}`);

    // Read file content as text
    const queryContent = req.file.buffer.toString('utf-8');

    // Make request to Data Lake Jobs API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const dataLakeUrl = `${cleanTenantUrl}/DATAFABRIC/compass/v2/jobs`;
    console.log(`[ION Data Lake] Sending to: ${dataLakeUrl}`);

    // The query is sent as the body. Content-Type should be text/plain or application/sql depending on the API.
    // The requirement implies "dropping a file with the query which should be used as a body".
    // Assuming text/plain based on "accepts any type of document" but content is query.

    const response = await axios.post(dataLakeUrl, queryContent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      }
    });

    console.log(`[ION Data Lake] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Data Lake Error]', error.message);
    console.error('[ION Data Lake Error Details]', error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// IDP Import DPF Endpoint
app.post('/api/idp/import-dpf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token, ver } = req.query;

  if (!tenantUrl || !token || !ver) {
    return res.status(400).json({ error: 'Missing tenantUrl, token, or ver' });
  }

  try {
    console.log(`[IDP Import DPF] Processing file: ${req.file.originalname}`);
    console.log(`[IDP Import DPF] Version: ${ver}`);

    // Construct FormData
    const FormData = require('form-data');
    const form = new FormData();

    // Append 'ver' parameter
    form.append('ver', ver);

    // Append 'datajsonfile' (file)
    form.append('datajsonfile', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || 'application/octet-stream' // Default if unknown
    });

    // Make request to IDP API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const idpUrl = `${cleanTenantUrl}/COLEMANDDP/iddpuisvc/ui/v1/ImportDPF`;
    console.log(`[IDP Import DPF] Sending to: ${idpUrl}`);

    const response = await axios.post(idpUrl, form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders() // Add Content-Type with boundary
      }
    });

    console.log(`[IDP Import DPF] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[IDP Import DPF Error]', error.message);
    console.error('[IDP Import DPF Error Details]', error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});
// IDM Configuration Import Endpoint
app.post('/api/idm-config-import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[IDM Config Import] Processing file: ${req.file.originalname}`);
    console.log(`[IDM Config Import] Size: ${req.file.size} bytes`);

    // Make request to IDM Configuration Import API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const idmUrl = `${cleanTenantUrl}/IDM/api/config/importConfiguration`;
    console.log(`[IDM Config Import] Sending to: ${idmUrl}`);

    // Send the raw buffer as the body
    const response = await axios.post(idmUrl, req.file.buffer, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/xml', // Defaulting to XML as per request, but practically accepts octet-stream/raw
      }
    });

    console.log(`[IDM Config Import] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[IDM Config Import Error]', error.message);
    if (error.response) {
      console.error('[IDM Config Import Error Response]', error.response.data);
    }
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// ION Object Schemas Deployment Endpoint
app.post('/api/ion-object-schemas', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token, user } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[ION Object Schemas] Processing file: ${req.file.originalname}`);

    // Read file content as text
    const fileContent = req.file.buffer.toString('utf-8');

    let payload = fileContent;
    let contentType = 'application/json';

    // Try to auto-detect content type and format
    try {
      // If it's valid JSON, keep it as object so axios handles it
      payload = JSON.parse(fileContent);
    } catch (parseError) {
      // Not JSON, check if XML
      if (fileContent.trim().startsWith('<')) {
        contentType = 'application/xml';
      } else {
        contentType = 'text/plain';
      }
      // Use raw string as payload
      payload = fileContent;
    }

    // MAKE REQUEST TO IDM API
    // User requested to keep the slash before DATAFABRIC.
    // We strip trailing slash from tenantUrl and add /DATAFABRIC explicitly.
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    console.log('[ION Object Schemas] cleanTenantUrl (stripped):', cleanTenantUrl);

    // URL: .../DATAFABRIC/datacatalog/v1/object?user=...
    const ionUrl = `${cleanTenantUrl}/DATAFABRIC/datacatalog/v1/object?user=${encodeURIComponent(user || 'Unknown')}`;
    console.log(`[ION Object Schemas] Sending to: ${ionUrl} as ${contentType}`);

    const response = await axios.post(ionUrl, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType
      }
    });

    console.log(`[ION Object Schemas] Success for: ${req.file.originalname}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data
    });

  } catch (error) {
    console.error('[ION Object Schemas Error]', error.message);
    if (error.response) {
      console.error('[ION Object Schemas Error Details]', error.response.data);
    }
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Coleman AI Dataset Upload Endpoint
app.post('/api/ai/datasets/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token, username } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[AI Dataset Upload] Processing file: ${req.file.originalname}`);

    // Read file content as text
    const fileContent = req.file.buffer.toString('utf-8');

    // Extract filename without extension
    const filename = req.file.originalname;
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;

    // Construct Payload as per user request
    const payload = {
      datasetName: nameWithoutExt,
      description: username ? `${nameWithoutExt} Deployed by ${username}` : nameWithoutExt,
      datalakeSource: fileContent,
      datasetType: "DATALAKE_QUERY"
    };

    // Make request to Coleman AI API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const colemanUrl = `${cleanTenantUrl}/COLEMANAI/data/model/v1/datasets/datalake/query`;
    console.log(`[AI Dataset Upload] Sending to: ${colemanUrl}`);

    const response = await axios.post(colemanUrl, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[AI Dataset Upload] Success for: ${filename}`);
    res.json({
      success: true,
      filename: filename,
      response: response.data
    });

  } catch (error) {
    console.error('[AI Dataset Upload Error]', error.message);
    if (error.response) {
      console.error('[AI Dataset Upload Error Details]', error.response.data);
    }
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});


// Coleman AI Dataset Load Endpoint
app.post('/api/ai/datasets/load', async (req, res) => {
  const { datasetNames } = req.body;
  const { tenantUrl, token } = req.query;

  if (!datasetNames || !tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing datasetNames, tenantUrl, or token' });
  }

  const results = [];
  const errors = [];

  // Split comma-separated names and trim whitespace
  const names = datasetNames.split(',').map(name => name.trim()).filter(name => name.length > 0);

  if (names.length === 0) {
    return res.status(400).json({ error: 'No valid dataset names provided' });
  }

  const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;

  console.log(`[AI Dataset Load] Processing ${names.length} datasets: ${names.join(', ')}`);

  for (const name of names) {
    try {
      // URL: .../COLEMANAI/data/model/v1/datasets/datalake/query/load/{datasetName}
      const colemanUrl = `${cleanTenantUrl}/COLEMANAI/data/model/v1/datasets/datalake/query/load/${encodeURIComponent(name)}`;
      console.log(`[AI Dataset Load] calling: ${colemanUrl}`);

      const response = await axios.post(colemanUrl, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      results.push({ name, status: 'success', data: response.data });
    } catch (error) {
      console.error(`[AI Dataset Load Error] Failed for ${name}:`, error.message);
      errors.push({
        name,
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  }

  res.json({
    success: errors.length === 0,
    total: names.length,
    successful: results,
    failed: errors
  });
});

// Coleman AI Custom Algorithm Creation Endpoint
app.post('/api/ai/custom-algorithms', async (req, res) => {
  const { zipFileName, csvFileName, pythonVersion } = req.body;
  const { tenantUrl, token, username } = req.query;

  if (!zipFileName || !csvFileName || !pythonVersion || !tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const name = zipFileName.split('.').slice(0, -1).join('.') || zipFileName;
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const colemanUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/mlcustomalgorithms`;

    console.log(`[AI Custom Algo] Creating algorithm: ${name}`);

    // Construct payload with description if username exists
    const payload = {
      name: name,
      pathCode: zipFileName,
      pathHyperParameters: csvFileName,
      properties: {
        pythonVersion: pythonVersion,
        jupyterHubVersion: "4.2"
      }
    };

    if (username) {
      payload.description = `Deployed by ${username}`;
    }

    console.log(`[AI Custom Algo] Payload:`, payload);

    const response = await axios.post(colemanUrl, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[AI Custom Algo] Success:`, response.data);
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error('[AI Custom Algo Error]', error.message);
    if (error.response) {
      console.error('[AI Custom Algo Error Details]', error.response.data);
    }
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Coleman AI Code Upload Endpoint
app.post('/api/ai/custom-algorithms/upload-code', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { customAlgorithmName, totalSize, chunkSize, chunkNumber, totalChunksNumber, fileName, encoding } = req.query;
  const { tenantUrl, token } = req.query;

  if (!customAlgorithmName || !tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const colemanUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/mlcustomalgorithms/${customAlgorithmName}/code`;

    console.log(`[AI Code Upload] Uploading code for: ${customAlgorithmName}`);

    // Construct FormData for the forwarded request
    const formData = new FormData();
    // The blob must have the filename/content-type for correct handling by the target API
    const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('data', fileBlob, req.file.originalname);

    const response = await axios.post(colemanUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      params: {
        totalSize,
        chunkSize,
        chunkNumber,
        totalChunksNumber,
        fileName,
        encoding
      }
    });

    console.log(`[AI Code Upload] Success for: ${customAlgorithmName}`);
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error('[AI Code Upload Error]', error.message);
    if (error.response) console.error(error.response.data);
    res.status(500).json({
      error: error.response?.data?.message || 'Code upload failed',
      details: error.response?.data
    });
  }
});

// Coleman AI Hyperparameters Upload Endpoint
app.post('/api/ai/custom-algorithms/upload-hyperparams', upload.single('file'), async (req, res) => {
  console.log('[AI Hyperparam Upload] === ENDPOINT HIT ===');
  console.log('[AI Hyperparam Upload] File received:', !!req.file);
  console.log('[AI Hyperparam Upload] Query params:', req.query);

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { customAlgorithmName, mimeType, fileName } = req.query;
  const { tenantUrl, token } = req.query;

  if (!customAlgorithmName || !tenantUrl || !token) {
    console.log('[AI Hyperparam Upload] Missing params - algo:', customAlgorithmName, 'url:', !!tenantUrl, 'token:', !!token);
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const colemanUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/mlcustomalgorithms/${customAlgorithmName}/hyperparameters`;

    console.log(`[AI Hyperparam Upload] Uploading for: ${customAlgorithmName}`);
    console.log(`[AI Hyperparam Upload] File: ${fileName || req.file.originalname}, Size: ${req.file.size}`);

    // Use form-data library per user specification
    const FormData = require('form-data');
    const form = new FormData();

    // Append as 'file' key with the CSV file buffer
    // Pass filename and contentType as options object
    form.append('file', req.file.buffer, {
      filename: fileName || req.file.originalname,
      contentType: 'text/csv'
    });

    // Send request with Authorization header and form-data headers
    const response = await axios.post(colemanUrl, form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()  // Adds Content-Type with boundary
      },
      params: {
        mimeType: mimeType || req.file.mimetype || 'application/csv',
        fileName: fileName || req.file.originalname
      }
    });

    console.log(`[AI Hyperparam Upload] Success. Status: ${response.status}`);
    console.log(`[AI Hyperparam Upload] Response:`, JSON.stringify(response.data, null, 2));
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error('[AI Hyperparam Upload Error]', error.message);
    if (error.response) {
      console.error('[AI Hyperparam Upload Error] Status:', error.response.status);
      console.error('[AI Hyperparam Upload Error] Response:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({
      error: error.response?.data?.message || 'Hyperparameter upload failed',
      details: error.response?.data
    });
  }
});

// Coleman AI Custom Algorithm Deploy Endpoint
app.post('/api/ai/custom-algorithms/deploy', async (req, res) => {
  const { customAlgorithmNames } = req.body;
  const { tenantUrl, token } = req.query;

  if (!customAlgorithmNames || !tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing customAlgorithmNames, tenantUrl, or token' });
  }

  const names = customAlgorithmNames.split(',').map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) {
    return res.status(400).json({ error: 'No valid custom algorithm names provided' });
  }

  const results = [];
  const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;

  console.log(`[AI Custom Algo Deploy] deploying: ${names.join(', ')}`);

  for (const name of names) {
    try {
      const deployUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/mlcustomalgorithms/${encodeURIComponent(name)}/deploy`;
      console.log(`[AI Custom Algo Deploy] calling: ${deployUrl}`);

      const response = await axios.post(deployUrl, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      results.push({ name, status: 'success', data: response.data });
      console.log(`[AI Custom Algo Deploy] Success for: ${name}`);

    } catch (error) {
      console.error(`[AI Custom Algo Deploy Error] Failed for ${name}:`, error.message);
      results.push({
        name,
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  }

  res.json({
    success: results.some(r => r.status === 'success'),
    results
  });
});

// Coleman AI Quest Deployment Endpoint
app.post('/api/ai/quests', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token, username } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[AI Quest Deploy] Processing file: ${req.file.originalname}`);

    // Read and parse JSON
    const fileContent = req.file.buffer.toString('utf-8');
    let questPayload;
    try {
      questPayload = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON in file' });
    }

    // Update description with username
    if (username && questPayload.quest) {
      const currentDesc = questPayload.quest.description || '';
      questPayload.quest.description = `${currentDesc} Deployed by ${username}`.trim();
      console.log(`[AI Quest Deploy] Updated description: ${questPayload.quest.description}`);
    }

    // Make request to Coleman AI API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const colemanUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/mlquests`;
    console.log(`[AI Quest Deploy] Sending to: ${colemanUrl}`);
    console.log(`[AI Quest Deploy] Token prefix: ${token.substring(0, 10)}...`);

    const response = await axios.post(colemanUrl, questPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300 || status === 500; // Treat 500 as success per user request
      }
    });

    console.log(`[AI Quest Deploy] Success. Status: ${response.status}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data,
      status: response.status
    });

  } catch (error) {
    console.error('[AI Quest Deploy Error]', error.message);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Coleman AI Quest Training Endpoint
app.post('/api/ai/quests/train', async (req, res) => {
  const { questNames } = req.body;
  const { tenantUrl, token } = req.query;

  if (!questNames || !tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing questNames, tenantUrl, or token' });
  }

  const names = questNames.split(',').map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) {
    return res.status(400).json({ error: 'No valid quest names provided' });
  }

  const results = [];
  const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;

  console.log(`[AI Quest Train] Processing: ${names.join(', ')}`);

  for (const name of names) {
    try {
      const trainUrl = `${cleanTenantUrl}/COLEMANAI/ml/model/v1/mlquests/${encodeURIComponent(name)}/trainingrun`;
      console.log(`[AI Quest Train] calling: ${trainUrl}`);

      const response = await axios.post(trainUrl, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      results.push({ name, status: 'success', data: response.data });
      console.log(`[AI Quest Train] Success for: ${name}`);

    } catch (error) {
      console.error(`[AI Quest Train Error] For ${name}:`, error.message);
      results.push({
        name,
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  }

  res.json({
    success: results.some(r => r.status === 'success'),
    results
  });
});

// Coleman AI Optimization Quest Deployment Endpoint
app.post('/api/ai/optimization/quests', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { tenantUrl, token, username } = req.query;

  if (!tenantUrl || !token) {
    return res.status(400).json({ error: 'Missing tenantUrl or token' });
  }

  try {
    console.log(`[Optimization Quest Deploy] Processing file: ${req.file.originalname}`);

    // Read and parse JSON
    const fileContent = req.file.buffer.toString('utf-8');
    let questPayload;
    try {
      questPayload = JSON.parse(fileContent);
    } catch (parseError) {
      // If not JSON, we might pass it as is or error. Requirement says "any type" but also "add description".
      // Only JSON allows adding description easily. If not JSON, we'll try to just send it?
      // But user specifically said "in the description add the Deployed by username".
      // This implies it IS a JSON with a description field.
      // We will error if not JSON for now to be safe, or just warn.
      return res.status(400).json({ error: 'File must be a valid JSON to update description.' });
    }

    // Update description with username
    // Assuming structure matches ML Quest: root object or 'quest' object?
    // User said "use the body", implied the file content IS the body.
    // We'll look for a 'description' field at root or assume standard Coleman structure.
    // Safest is to check root first.

    // Note: User didn't specify exact JSON structure, but usually it's like { name:..., description:... }
    // We will attempt to update description if it exists, or add it.

    let targetObject = questPayload;
    if (questPayload.quest) {
      targetObject = questPayload.quest;
    }

    const currentDesc = targetObject.description || '';
    targetObject.description = `${currentDesc} Deployed by ${username}`.trim();
    console.log(`[Optimization Quest Deploy] Updated description: ${targetObject.description}`);

    // Make request to Coleman AI API
    const cleanTenantUrl = tenantUrl.endsWith('/') ? tenantUrl.slice(0, -1) : tenantUrl;
    const colemanUrl = `${cleanTenantUrl}/COLEMANAI/optimization/model/v1/quests`;
    console.log(`[Optimization Quest Deploy] Sending to: ${colemanUrl}`);
    console.log(`[Optimization Quest Deploy] Token prefix: ${token.substring(0, 10)}...`);

    const response = await axios.post(colemanUrl, questPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300 || status === 500;
      }
    });

    console.log(`[Optimization Quest Deploy] Success. Status: ${response.status}`);
    res.json({
      success: true,
      filename: req.file.originalname,
      response: response.data,
      status: response.status
    });

  } catch (error) {
    console.error('[Optimization Quest Deploy Error]', error.message);
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Jira Integration Endpoint
app.post('/api/jira/tickets', async (req, res) => {
  const { summary, description, priority = 'Medium', issuetype = 'Task', projectKey } = req.body;

  if (!summary || !description) {
    return res.status(400).json({ error: 'Summary and Description are required.' });
  }

  // Credentials from environment variables
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
  // Use provided projectKey or fallback to env/default
  const PROJECT_KEY = projectKey || process.env.PROJECT_KEY || 'KAN';

  try {
    const authString = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

    // Construct ADF (Atlassian Document Format) for description
    const descriptionADF = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: description
            }
          ]
        }
      ]
    };

    const payload = {
      fields: {
        project: { key: PROJECT_KEY },
        summary: summary,
        issuetype: { name: issuetype },
        priority: { name: priority },
        description: descriptionADF
      }
    };

    console.log(`[Jira] Creating ticket: ${summary}`);
    console.log(`[Jira] Project Key: ${PROJECT_KEY}`);
    console.log(`[Jira] Full Payload:`, JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://infor.atlassian.net/rest/api/3/issue',
      payload,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json'
        },
        validateStatus: status => status < 500 // Let us handle 400s
      }
    );

    if (response.status >= 300) {
      console.error('[Jira Error]', response.data);
      return res.status(response.status).json({ error: 'Jira API Error', details: response.data });
    }

    const { key } = response.data;
    const ticketUrl = `https://infor.atlassian.net/browse/${key}`;

    console.log(`[Jira] Ticket Created: ${key}`);
    res.json({
      success: true,
      issueKey: key,
      url: ticketUrl
    });

  } catch (error) {
    console.error('[Jira Proxy Error]', error.message);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});


// User Activity Storage (In-Memory)
const activeUsers = new Map();

// Record User Activity Endpoint
app.post('/api/users/activity', (req, res) => {
  const { username, displayName, email, tenantId } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const userId = username; // Unique identifier
  const now = new Date();

  const userData = {
    username,
    displayName: displayName || username,
    email,
    tenantId,
    lastLogin: now.toISOString()
  };

  activeUsers.set(userId, userData);
  console.log(`[User Activity] Updated activity for ${username}`);

  res.json({ success: true, activity: userData });
});

// Get User Activity Endpoint
app.get('/api/users/activity', (req, res) => {
  // Convert Map to Array and sort by lastLogin (descending)
  const users = Array.from(activeUsers.values()).sort((a, b) => {
    return new Date(b.lastLogin) - new Date(a.lastLogin);
  });

  res.json({ users });
});

// Keep Alive Logic (Prevents Render Free Tier from Sleeping)
const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  // Ping the backend every 14 minutes (Render sleeps after 15)
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`[KeepAlive] Setting up self-ping to ${url}`);
    setInterval(async () => {
      try {
        await axios.get(`${url}/api/users/activity`); // Lightweight endpoint
        console.log(`[KeepAlive] Ping sent to ${url}`);
      } catch (error) {
        console.error(`[KeepAlive] Ping failed: ${error.message}`);
      }
    }, 14 * 60 * 1000); // 14 Minutes
  }
};

console.log('Starting server...');

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend proxy server running on http://0.0.0.0:${PORT}`);
  keepAlive();
});

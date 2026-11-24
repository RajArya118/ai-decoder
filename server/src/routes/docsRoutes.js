import express from 'express';

const router = express.Router();

const API_SPEC = {
  openapi: '3.0.0',
  info: {
    title: 'AI DECODER REST API Specification',
    version: '3.2.0',
    description: 'Advanced Multimodal Cybersecurity Intelligence & Decoding Engine API'
  },
  endpoints: [
    {
      path: '/api/decode/text',
      method: 'POST',
      auth: 'Optional (Bearer Token or X-API-Key)',
      description: 'Decode and explain obscure text, ciphers, and jargon',
      body: { input: 'String (required)', mode: 'standard | eli5 | cybersecurity | linguistic', autoDetect: 'Boolean' }
    },
    {
      path: '/api/decode/code',
      method: 'POST',
      auth: 'Optional',
      description: 'Inspect source code, compute Big-O complexity, and audit OWASP vulnerabilities',
      body: { code: 'String (required)', language: 'javascript | python | rust | sql | ...', mode: 'explain | security | complexity | refactor' }
    },
    {
      path: '/api/decode/cipher',
      method: 'POST',
      auth: 'Optional',
      description: 'Deterministic conversion + AI audit for Base64, Hex, Binary, JWT, URL, ROT13, Morse',
      body: { input: 'String (required)', cipherType: 'base64 | jwt | url | hex | binary | rot13 | morse', action: 'decode | encode' }
    },
    {
      path: '/api/decode/qr',
      method: 'POST',
      auth: 'Optional',
      description: 'Audit QR / barcode payload for phishing, redirects, or WiFi configs',
      body: { payload: 'String (required)', format: 'String' }
    },
    {
      path: '/api/decode/image',
      method: 'POST',
      auth: 'Optional',
      description: 'Multipart image upload for multimodal vision OCR and diagram analysis',
      body: 'FormData (image: binary, prompt: string)'
    },
    {
      path: '/api/decode/prompt',
      method: 'POST',
      auth: 'Optional',
      description: 'Evaluate prompt clarity, constraint adherence, anti-patterns, and generate optimized variations',
      body: { promptText: 'String (required)', targetModel: 'String', goal: 'String' }
    },
    {
      path: '/api/chat',
      method: 'POST',
      auth: 'Optional',
      description: 'Context-aware AI conversation grounded in active decoded artifact',
      body: { decodeId: 'String', message: 'String (required)' }
    },
    {
      path: '/api/history',
      method: 'GET',
      auth: 'Optional',
      description: 'List past decodes with search, type filter, and bookmark filter',
      query: { type: 'String', search: 'String', bookmarkedOnly: 'Boolean' }
    },
    {
      path: '/api/history/export',
      method: 'GET',
      auth: 'Optional',
      description: 'Export all decoded vault records to Markdown or JSON',
      query: { format: 'markdown | json' }
    },
    {
      path: '/api/auth/register',
      method: 'POST',
      auth: 'Public',
      description: 'Register operator profile and obtain JWT token',
      body: { name: 'String', email: 'String', password: 'String' }
    },
    {
      path: '/api/auth/login',
      method: 'POST',
      auth: 'Public',
      description: 'Authenticate operator and obtain JWT token',
      body: { email: 'String', password: 'String' }
    },
    {
      path: '/api/admin/stats',
      method: 'GET',
      auth: 'Admin Role Required',
      description: 'Telemetry, aggregate decoding statistics, and active database status'
    }
  ]
};

router.get('/', (req, res) => {
  if (req.headers.accept?.includes('application/json')) {
    return res.json(API_SPEC);
  }

  // Render a dark HUD styled HTML API reference
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI DECODER — API Explorer & Specs</title>
  <style>
    body { background: #070A10; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: #00F0FF; font-family: monospace; border-bottom: 1px solid #1E293B; padding-bottom: 0.5rem; }
    .endpoint { background: #0E1420; border: 1px solid rgba(0,240,255,0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
    .post { background: rgba(0, 240, 255, 0.2); color: #00F0FF; }
    .get { background: rgba(16, 185, 129, 0.2); color: #10B981; }
    .path { font-family: monospace; font-size: 14px; font-weight: bold; margin-left: 8px; color: #fff; }
    .desc { font-size: 13px; color: #94A3B8; margin: 8px 0; }
    pre { background: #04060A; padding: 8px; border-radius: 4px; font-size: 12px; color: #38BDF8; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ AI DECODER — OpenAPI Documentation (v3.2.0)</h1>
    <p style="color: #94A3B8; font-size: 13px;">JSON Specification endpoint available at: <code>Accept: application/json</code></p>
    ${API_SPEC.endpoints
      .map(
        (e) => `
      <div class="endpoint">
        <div>
          <span class="badge ${e.method.toLowerCase()}">${e.method}</span>
          <span class="path">${e.path}</span>
          <span style="float: right; font-size: 11px; color: #64748B; font-family: monospace;">${e.auth}</span>
        </div>
        <div class="desc">${e.description}</div>
        ${e.body ? `<pre>Request Body: ${typeof e.body === 'object' ? JSON.stringify(e.body, null, 2) : e.body}</pre>` : ''}
      </div>`
      )
      .join('')}
  </div>
</body>
</html>`;

  res.send(html);
});

export default router;

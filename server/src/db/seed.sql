-- ====================================================================
-- AI DECODER — Relational Seed Data (PostgreSQL)
-- ====================================================================

-- 1. Insert Users (Admin, Security Analyst, Standard Operator)
INSERT INTO users (id, name, email, password_hash, role, api_key) VALUES
('a0000000-0000-0000-0000-000000000001', 'Chief Operator', 'admin@ai-decoder.io', '$2a$10$wT0lU96F8tZ.N8iZ5zF8xe6nCqU9uUvP6B7zB.9gO4mC.7jA1t7Ua', 'admin', 'aid_admin_master_key_998877'),
('a0000000-0000-0000-0000-000000000002', 'Lead Security Analyst', 'analyst@ai-decoder.io', '$2a$10$wT0lU96F8tZ.N8iZ5zF8xe6nCqU9uUvP6B7zB.9gO4mC.7jA1t7Ua', 'analyst', 'aid_analyst_key_112233'),
('a0000000-0000-0000-0000-000000000003', 'Junior Developer', 'dev@ai-decoder.io', '$2a$10$wT0lU96F8tZ.N8iZ5zF8xe6nCqU9uUvP6B7zB.9gO4mC.7jA1t7Ua', 'user', 'aid_user_key_445566')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Decode Records (Linked to user_id Foreign Key)
INSERT INTO decode_records (id, user_id, decoder_type, raw_input, decoded_output, ai_summary, security_audit, complexity, detected_format, is_bookmarked, execution_time_ms) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'code', 
'app.post("/login", (req, res) => { db.query("SELECT * FROM users WHERE user=\'" + req.body.user + "\'"); });',
'Express.js SQL Injection via unescaped string concatenation',
'Express handler vulnerable to CWE-89 SQL Injection.',
'VULNERABILITY: CWE-89 SQL Injection (OWASP A03:2021).',
'Time: O(1) | Space: O(1)',
'Node.js Express Source',
TRUE,
16),

('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'text',
'SGVsbG8gQWdlbnQhIFRoZSBzZWNyZXQgcGFzc3BocmFzZSBpcyAiQ1lCRVItMjAyNiIu',
'Hello Agent! The secret passphrase is "CYBER-2026".',
'Decoded Base64 string containing operational credentials.',
'CLEAN: Standard text communication.',
'Entropy: Low',
'Base64 Text',
TRUE,
9)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Chat Messages (Linked to decode_id Foreign Key)
INSERT INTO chat_messages (decode_id, user_id, role, content) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'user', 'How do I patch this SQL injection?'),
('b0000000-0000-0000-0000-000000000001', NULL, 'assistant', 'Use parameterized queries: `db.query("SELECT * FROM users WHERE user = $1", [req.body.user])`. This delegates escaping to PostgreSQL.')
ON CONFLICT DO NOTHING;

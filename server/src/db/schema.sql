-- ====================================================================
-- AI DECODER — Relational Database Schema (PostgreSQL 14+)
-- Aligns with Web Development Roadmap 2026: Tables, Keys, Relationships & Joins
-- ====================================================================

-- 1. Enable UUID extension for cryptographically secure Primary Keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-migrating
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS decode_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================================================================
-- TABLE 1: USERS (Authentication & Role-Based Access Control - RBAC)
-- ====================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'analyst', 'admin')),
    api_key VARCHAR(64) UNIQUE,
    requests_today INT DEFAULT 0,
    max_requests_per_day INT DEFAULT 500,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for instant email lookups during login
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_api_key ON users(api_key);

-- ====================================================================
-- TABLE 2: DECODE_RECORDS (Core Decoded Payloads & AI Telemetry)
-- RELATIONSHIP: 1 User has Many Decode Records (1:N)
-- FOREIGN KEY: user_id references users(id) ON DELETE SET NULL
-- ====================================================================
CREATE TABLE decode_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    decoder_type VARCHAR(50) NOT NULL CHECK (decoder_type IN ('text', 'code', 'cipher', 'qr', 'image', 'jwt', 'prompt', 'url', 'base64')),
    raw_input TEXT NOT NULL,
    decoded_output TEXT NOT NULL,
    
    -- AI Semantic Breakdown (Structured JSONB document)
    ai_summary TEXT,
    ai_breakdown JSONB DEFAULT '[]'::jsonb,
    security_audit TEXT,
    complexity VARCHAR(100),
    detected_format VARCHAR(100),
    scores JSONB DEFAULT '{}'::jsonb,
    
    -- Telemetry & Flags
    execution_time_ms INT DEFAULT 0,
    token_estimate INT DEFAULT 0,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    client_ip VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compound Indexes for sub-millisecond querying
CREATE INDEX idx_decode_user_created ON decode_records(user_id, created_at DESC);
CREATE INDEX idx_decode_type_bookmarked ON decode_records(decoder_type, is_bookmarked);
CREATE INDEX idx_decode_detected_format ON decode_records(detected_format);

-- ====================================================================
-- TABLE 3: CHAT_MESSAGES (Contextual AI Copilot Conversation Threads)
-- RELATIONSHIP: 1 Decode Record has Many Chat Messages (1:N)
-- FOREIGN KEY: decode_id references decode_records(id) ON DELETE CASCADE
-- ====================================================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decode_id UUID NOT NULL REFERENCES decode_records(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_decode_id ON chat_messages(decode_id, created_at ASC);

-- ====================================================================
-- TABLE 4: AUDIT_LOGS (Security & Authentication Audit Trail)
-- RELATIONSHIP: 1 User has Many Audit Logs (1:N)
-- ====================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILURE', 'WARNING')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_action_created ON audit_logs(action, created_at DESC);

-- ====================================================================
-- RELATIONAL JOIN QUERY EXAMPLES (Roadmap 2026: Joins & Aggregations)
-- ====================================================================
-- Example 1: INNER JOIN - Fetch user details alongside their decode operations
-- SELECT d.id, d.decoder_type, d.decoded_output, d.execution_time_ms, u.name, u.email, u.role
-- FROM decode_records d
-- INNER JOIN users u ON d.user_id = u.id
-- WHERE d.is_bookmarked = TRUE
-- ORDER BY d.created_at DESC;

-- Example 2: LEFT JOIN & GROUP BY - Aggregate statistics per user role
-- SELECT u.role, COUNT(d.id) AS total_decodes, AVG(d.execution_time_ms) AS avg_duration_ms
-- FROM users u
-- LEFT JOIN decode_records d ON u.id = d.user_id
-- GROUP BY u.role;

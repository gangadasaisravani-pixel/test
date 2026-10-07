-- Supabase / PostgreSQL Migration: 001_initial_schema.sql
-- ClaimProof AI (Consumer Evidence Intelligence Platform)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for case status and evidence types
DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('DRAFT', 'ANALYZING', 'PENDING_INPUT', 'READY_FOR_NOTICE', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_type AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'SCREENSHOT', 'TEXT_NOTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fact_nature AS ENUM ('DIRECTLY_OBSERVED', 'EXTRACTED_TEXT', 'USER_REPORTED', 'AI_INFERENCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: Users (Consumer Profile)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address_line TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Cases
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(50) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    opposing_party VARCHAR(255) NOT NULL,
    transaction_amount NUMERIC(12, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    transaction_date DATE,
    order_reference_number VARCHAR(100),
    user_narrative TEXT NOT NULL,
    status case_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Evidence Files
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type evidence_type NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    user_description TEXT,
    raw_ai_transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Extracted Case Facts
CREATE TABLE IF NOT EXISTS case_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence_files(id) ON DELETE SET NULL,
    fact_statement TEXT NOT NULL,
    fact_nature fact_nature NOT NULL,
    confidence confidence_level NOT NULL DEFAULT 'MEDIUM',
    page_number INT,
    timestamp_seconds NUMERIC(8, 2),
    is_verified_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Timeline Events
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_date DATE,
    event_time TIME,
    is_date_uncertain BOOLEAN DEFAULT FALSE,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT NOT NULL,
    confidence confidence_level NOT NULL DEFAULT 'HIGH',
    evidence_references UUID[] DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Claims
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    claim_statement TEXT NOT NULL,
    requested_remedy TEXT NOT NULL,
    evidence_strength confidence_level DEFAULT 'MEDIUM',
    missing_proof_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Claim to Evidence Junction (Many-to-Many)
CREATE TABLE IF NOT EXISTS claim_evidence_map (
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES evidence_files(id) ON DELETE CASCADE,
    specific_support_excerpt TEXT,
    PRIMARY KEY (claim_id, evidence_id)
);

-- Table: Contradictions & Discrepancies
CREATE TABLE IF NOT EXISTS contradictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    fact_a_id UUID REFERENCES case_facts(id) ON DELETE SET NULL,
    fact_b_id UUID REFERENCES case_facts(id) ON DELETE SET NULL,
    discrepancy_description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'WARNING',
    is_resolved BOOLEAN DEFAULT FALSE,
    user_resolution_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: AI Follow-Up Questions
CREATE TABLE IF NOT EXISTS follow_up_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    rationale TEXT NOT NULL,
    target_evidence_type evidence_type,
    user_response TEXT,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Generated Complaint Packages
CREATE TABLE IF NOT EXISTS complaint_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    formal_notice_markdown TEXT NOT NULL,
    nch_grievance_text TEXT NOT NULL,
    evidence_checklist JSONB NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence_files(case_id);
CREATE INDEX IF NOT EXISTS idx_facts_case ON case_facts(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_case ON timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_claims_case ON claims(case_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_case ON contradictions(case_id);
CREATE INDEX IF NOT EXISTS idx_questions_case ON follow_up_questions(case_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_evidence_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE contradictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_packages ENABLE ROW LEVEL SECURITY;

-- Helper function for auth context if not present (Supabase auth.uid compat)
CREATE OR REPLACE FUNCTION auth_uid_fallback() RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID,
        '00000000-0000-0000-0000-000000000001'::UUID
    );
EXCEPTION WHEN OTHERS THEN
    RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies
DROP POLICY IF EXISTS users_isolation ON users;
CREATE POLICY users_isolation ON users
    FOR ALL USING (id = auth_uid_fallback());

DROP POLICY IF EXISTS cases_isolation ON cases;
CREATE POLICY cases_isolation ON cases
    FOR ALL USING (user_id = auth_uid_fallback());

DROP POLICY IF EXISTS evidence_isolation ON evidence_files;
CREATE POLICY evidence_isolation ON evidence_files
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS facts_isolation ON case_facts;
CREATE POLICY facts_isolation ON case_facts
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS timeline_isolation ON timeline_events;
CREATE POLICY timeline_isolation ON timeline_events
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS claims_isolation ON claims;
CREATE POLICY claims_isolation ON claims
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS claim_evidence_map_isolation ON claim_evidence_map;
CREATE POLICY claim_evidence_map_isolation ON claim_evidence_map
    FOR ALL USING (claim_id IN (SELECT c.id FROM claims c JOIN cases cs ON c.case_id = cs.id WHERE cs.user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS contradictions_isolation ON contradictions;
CREATE POLICY contradictions_isolation ON contradictions
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS follow_up_questions_isolation ON follow_up_questions;
CREATE POLICY follow_up_questions_isolation ON follow_up_questions
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

DROP POLICY IF EXISTS packages_isolation ON complaint_packages;
CREATE POLICY packages_isolation ON complaint_packages
    FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth_uid_fallback()));

-- Initial Seed Data: Default Demo User Profile
INSERT INTO users (id, email, full_name, phone_number, address_line, city, state, postal_code)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'consumer@claimproof.ai',
    'Aarav Sharma',
    '+91 98765 43210',
    '402, Lotus Greens, Sector 78',
    'Noida',
    'Uttar Pradesh',
    '201301'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Case (E-Commerce Defective OLED TV delivery dispute)
INSERT INTO cases (
    id,
    user_id,
    domain,
    subcategory,
    title,
    opposing_party,
    transaction_amount,
    currency,
    transaction_date,
    order_reference_number,
    user_narrative,
    status
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'ECOMMERCE_PRODUCT',
    'Damaged on Delivery',
    'Defective 55-Inch 4K OLED Smart TV with Shattered Display Panel',
    'OmniTech Retail Pvt. Ltd. (Flipkart Seller)',
    64999.00,
    'INR',
    '2026-09-15',
    'OD4092817294819',
    'Ordered a brand new 55-inch 4K OLED Smart TV on September 15, 2026 for ₹64,999. Delivery arrived on September 18 in a heavily crushed outer box. Upon opening the packaging in front of the technician on Sept 19, the inner panel was spider-web shattered. The technician refused to install it and stamped the unboxing sheet as DOA (Dead On Arrival). Customer support repeatedly rejects replacement claiming transit damage was not reported within 24 hours of delivery, which directly violates CPA 2019 guidelines and Flipkart''s open box delivery policy.',
    'ANALYZING'
)
ON CONFLICT (id) DO NOTHING;

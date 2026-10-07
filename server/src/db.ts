import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

let pool: pg.Pool | null = null;
let pgliteInstance: any = null;
let isPgliteMode = false;

import os from "os";

// Initialize embedded PGlite for resilient standalone execution when remote PostgreSQL is not available
async function initPgLite() {
  if (pgliteInstance) return pgliteInstance;
  try {
    const { PGlite } = await import("@electric-sql/pglite");
    const dataDir = path.resolve(process.env.LOCALAPPDATA || os.tmpdir(), "claimproof_pglite");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
    isPgliteMode = true;
    console.log("⚡ Standalone PostgreSQL (PGlite) engine active at:", dataDir);
    return pgliteInstance;
  } catch (err) {
    console.warn("Could not initialize PGlite:", err);
    throw err;
  }
}

export async function getDbClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.trim() !== "" && !databaseUrl.includes("localhost:5432/claimproof_db")) {
    if (!pool) {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes("supabase") || databaseUrl.includes("neon") ? { rejectUnauthorized: false } : undefined,
      });
    }
    return { type: "pg" as const, client: pool };
  }

  // Use embedded PGlite if no remote URL provided
  if (!pgliteInstance) {
    await initPgLite();
  }
  return { type: "pglite" as const, client: pgliteInstance };
}

export async function exec(sql: string): Promise<void> {
  const db = await getDbClient();
  if (db.type === "pg") {
    await db.client.query(sql);
  } else {
    // PGlite has exec() specifically for multi-statement DDL scripts
    await db.client.exec(sql);
  }
}

export async function query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  try {
    const db = await getDbClient();
    if (db.type === "pg") {
      const res = await db.client.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
    } else {
      // PGlite parameterized query
      const res = await db.client.query(sql, params);
      return { rows: res.rows || [], rowCount: (res.rows && res.rows.length) || 0 };
    }
  } catch (err: any) {
    // If remote PG connection failed, fallback seamlessly to PGlite
    if (pool && !isPgliteMode && (err.code === "ECONNREFUSED" || err.message?.includes("connect"))) {
      console.warn("⚠️ Remote PostgreSQL connection unreachable. Switching to embedded PGlite engine...");
      pool = null;
      await initPgLite();
      const res = await pgliteInstance.query(sql, params);
      return { rows: res.rows || [], rowCount: (res.rows && res.rows.length) || 0 };
    }
    console.error("Database query error:", err.message, "SQL:", sql);
    throw err;
  }
}

/**
 * Initializes schema and default seed data
 */
export async function initializeDatabase() {
  console.log("Checking database schema and connectivity...");
  
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone_number TEXT,
      address_line TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      domain TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      title TEXT NOT NULL,
      opposing_party TEXT NOT NULL,
      transaction_amount NUMERIC(12, 2),
      currency TEXT DEFAULT 'INR',
      transaction_date DATE,
      order_reference_number TEXT,
      user_narrative TEXT NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evidence_files (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size_bytes BIGINT NOT NULL,
      sha256_hash TEXT NOT NULL,
      user_description TEXT,
      raw_ai_transcript TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS case_facts (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      evidence_id TEXT REFERENCES evidence_files(id) ON DELETE SET NULL,
      fact_statement TEXT NOT NULL,
      fact_nature TEXT NOT NULL,
      confidence TEXT NOT NULL DEFAULT 'MEDIUM',
      page_number INT,
      timestamp_seconds NUMERIC(8, 2),
      is_verified_by_user BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      event_date DATE,
      event_time TIME,
      is_date_uncertain BOOLEAN DEFAULT FALSE,
      event_title TEXT NOT NULL,
      event_description TEXT NOT NULL,
      confidence TEXT NOT NULL DEFAULT 'HIGH',
      evidence_references TEXT[] DEFAULT '{}',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      claim_statement TEXT NOT NULL,
      requested_remedy TEXT NOT NULL,
      evidence_strength TEXT DEFAULT 'MEDIUM',
      missing_proof_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS claim_evidence_map (
      claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
      evidence_id TEXT NOT NULL REFERENCES evidence_files(id) ON DELETE CASCADE,
      specific_support_excerpt TEXT,
      PRIMARY KEY (claim_id, evidence_id)
    );

    CREATE TABLE IF NOT EXISTS contradictions (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      fact_a_id TEXT REFERENCES case_facts(id) ON DELETE SET NULL,
      fact_b_id TEXT REFERENCES case_facts(id) ON DELETE SET NULL,
      discrepancy_description TEXT NOT NULL,
      severity TEXT DEFAULT 'WARNING',
      is_resolved BOOLEAN DEFAULT FALSE,
      user_resolution_comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS follow_up_questions (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      rationale TEXT NOT NULL,
      target_evidence_type TEXT,
      user_response TEXT,
      is_answered BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaint_packages (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      formal_notice_markdown TEXT NOT NULL,
      nch_grievance_text TEXT NOT NULL,
      evidence_checklist JSONB NOT NULL,
      version INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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

    INSERT INTO cases (
      id, user_id, domain, subcategory, title, opposing_party,
      transaction_amount, currency, transaction_date, order_reference_number,
      user_narrative, status
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
      'Ordered a brand new 55-inch 4K OLED Smart TV on September 15, 2026 for ₹64,999. Delivery arrived on September 18 in a heavily crushed outer box. Upon opening the packaging in front of the technician on Sept 19, the inner panel was spider-web shattered. The technician refused to install it and stamped the unboxing sheet as DOA. Customer support repeatedly rejects replacement claiming transit damage was not reported within 24 hours of delivery, which directly violates CPA 2019 guidelines and Flipkart open box delivery policy.',
      'ANALYZING'
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  await exec(ddl);
  console.log("✅ Core schema and initial data verified successfully.");
}

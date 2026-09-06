// src/lib/db/setup-supabase.ts
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

export const FOUNDATIONAL_SERVICES: [string, string, string, string, string, number, string, number][] = [
  ['srv_biz_web', 'BIZ-WEB', 'Business Websites', 'Modern, high-converting corporate and brand websites engineered for market credibility and lead generation.', 'Websites', 45000000, 'NGN', 1],
  ['srv_ecom', 'E-COMM', 'E-commerce Websites', 'Scalable online storefronts with cart management, inventory tracking, and seamless checkout flows.', 'E-commerce', 85000000, 'NGN', 1],
  ['srv_rest', 'REST-ORDER', 'Restaurant Websites & Ordering Systems', 'Custom restaurant digital hubs with real-time digital menus, table reservation, and direct order workflows.', 'Hospitality', 65000000, 'NGN', 1],
  ['srv_prop', 'PROP-AIRBNB', 'Property & Airbnb Websites', 'Direct booking and showcase platforms for real estate developers, short-let operators, and property managers.', 'Real Estate', 75000000, 'NGN', 1],
  ['srv_book', 'BOOK-SYS', 'Booking Systems', 'Automated reservation, appointment scheduling, calendar integration, and client notification engines.', 'Applications', 55000000, 'NGN', 1],
  ['srv_land', 'LAND-PAGES', 'Landing Pages', 'Precision-crafted single-page experiences optimized for paid ad campaigns and maximum conversion velocity.', 'Marketing', 25000000, 'NGN', 1],
  ['srv_webapp', 'WEB-APP', 'Custom Web Applications', 'Purpose-built software applications engineered to streamline core business operations and customer self-service.', 'Applications', 120000000, 'NGN', 1],
  ['srv_port', 'CUST-PORTAL', 'Customer Portals', 'Secure client-facing dashboards for document exchange, service requests, invoicing, and account management.', 'Applications', 90000000, 'NGN', 1],
  ['srv_dash', 'ADMIN-DASH', 'Admin Dashboards', 'Comprehensive control panels with operational metrics, analytics, permissions, and business management tools.', 'Dashboards', 80000000, 'NGN', 1],
  ['srv_soft', 'CUSTOM-SW', 'Custom Business Software', 'Tailor-made software solutions built around proprietary business workflows and operational bottlenecks.', 'Enterprise', 150000000, 'NGN', 1],
  ['srv_mgmt', 'BIZ-MGMT', 'Business Management Systems', 'End-to-end digital operating systems integrating CRM, resource planning, and internal communications.', 'Enterprise', 180000000, 'NGN', 1],
  ['srv_redesign', 'SITE-REDESIGN', 'Website Redesigns', 'Complete architectural overhaul, performance upgrade, and visual modernization of legacy corporate sites.', 'Websites', 40000000, 'NGN', 1],
  ['srv_maint', 'TECH-SUPPORT', 'Maintenance & Technical Support', 'Ongoing code upkeep, security patches, uptime monitoring, and SLA-backed engineering support.', 'Support', 20000000, 'NGN', 1],
  ['srv_host', 'HOST-INFRA', 'Hosting & Domain Assistance', 'High-availability cloud deployment, DNS configuration, SSL provisioning, and cloud infrastructure setup.', 'Infrastructure', 15000000, 'NGN', 1],
];

export const POSTGRES_SCHEMA_SQL = `
-- Compatibility helpers for seamless SQLite -> PostgreSQL migration
CREATE OR REPLACE FUNCTION datetime(val text DEFAULT 'now') RETURNS timestamptz AS $$
  SELECT NOW();
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION date(val text DEFAULT 'now', mod text DEFAULT NULL) RETURNS date AS $$
  SELECT CURRENT_DATE;
$$ LANGUAGE SQL IMMUTABLE;

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  currency VARCHAR(8) NOT NULL,
  phone_code VARCHAR(16) NOT NULL,
  timezone TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Core Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'COUNTRY_MANAGER', 'REPRESENTATIVE', 'DEVELOPER', 'CLIENT')),
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')),
  google_id VARCHAR(255),
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotently ensure google_id column exists on existing production tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  country_id VARCHAR(64) REFERENCES countries(id),
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Representatives
CREATE TABLE IF NOT EXISTS representatives (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_id VARCHAR(64) NOT NULL REFERENCES countries(id),
  approval_status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')),
  commission_rate_bps INTEGER NOT NULL DEFAULT 2000,
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(64) REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id VARCHAR(64),
  company_name TEXT NOT NULL,
  industry TEXT,
  country_id VARCHAR(64) NOT NULL REFERENCES countries(id),
  representative_id VARCHAR(64) REFERENCES representatives(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone TEXT NOT NULL,
  country_id VARCHAR(64) NOT NULL REFERENCES countries(id),
  business_type TEXT NOT NULL,
  requirements TEXT NOT NULL,
  estimated_budget_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  representative_id VARCHAR(64) REFERENCES representatives(id),
  status VARCHAR(32) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'REQUIREMENTS_COLLECTED', 'PROPOSAL', 'WON', 'LOST')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services Catalog
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client_id VARCHAR(64) NOT NULL REFERENCES clients(id),
  representative_id VARCHAR(64) REFERENCES representatives(id),
  lead_id VARCHAR(64) REFERENCES leads(id),
  service_id VARCHAR(64) REFERENCES services(id),
  status VARCHAR(32) NOT NULL DEFAULT 'PLANNING' CHECK (status IN (
    'DRAFT', 'AWAITING_PAYMENT', 'PLANNING', 'DEVELOPMENT', 'INTERNAL_REVIEW',
    'CLIENT_REVIEW', 'REVISION', 'APPROVED', 'DEPLOYMENT',
    'COMPLETED', 'MAINTENANCE'
  )),
  payment_status VARCHAR(32) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID')),
  budget_minor BIGINT NOT NULL DEFAULT 0,
  total_paid_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  country_id VARCHAR(64) NOT NULL REFERENCES countries(id),
  start_date DATE,
  started_at TIMESTAMPTZ,
  target_completion_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Members
CREATE TABLE IF NOT EXISTS project_members (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(64) PRIMARY KEY,
  proposal_number VARCHAR(64) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_current INTEGER NOT NULL DEFAULT 1,
  lead_id VARCHAR(64) REFERENCES leads(id),
  client_id VARCHAR(64) NOT NULL REFERENCES clients(id),
  project_id VARCHAR(64) REFERENCES projects(id),
  representative_id VARCHAR(64) REFERENCES representatives(id),
  title TEXT NOT NULL,
  scope_of_work TEXT NOT NULL,
  deliverables_json TEXT NOT NULL DEFAULT '[]',
  payment_structure_type VARCHAR(32) NOT NULL DEFAULT 'FULL_UPFRONT' CHECK (payment_structure_type IN ('FULL_UPFRONT', 'DEPOSIT_MILESTONES', 'CUSTOM')),
  payment_schedule_json TEXT NOT NULL DEFAULT '[]',
  total_amount_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'KES',
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'CLIENT_APPROVED', 'CLIENT_REJECTED', 'EXPIRED', 'CANCELLED')),
  valid_until TIMESTAMPTZ,
  terms_notes TEXT,
  rejection_reason TEXT,
  created_by VARCHAR(64) REFERENCES users(id),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_version INTEGER,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(proposal_number, version)
);

CREATE INDEX IF NOT EXISTS idx_proposals_client ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_number ON proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposals_rep ON proposals(representative_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Payment Schedules
CREATE TABLE IF NOT EXISTS payment_schedules (
  id VARCHAR(64) PRIMARY KEY,
  proposal_id VARCHAR(64) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES projects(id),
  schedule_type VARCHAR(32) NOT NULL CHECK (schedule_type IN ('FULL_UPFRONT', 'DEPOSIT_MILESTONES', 'CUSTOM')),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  percentage_bps INTEGER NOT NULL,
  amount_minor BIGINT NOT NULL,
  currency VARCHAR(8) NOT NULL CHECK (currency IN ('KES', 'NGN')),
  is_required_to_start INTEGER NOT NULL DEFAULT 0,
  billing_trigger VARCHAR(32) NOT NULL CHECK (billing_trigger IN ('UPFRONT_APPROVAL', 'MILESTONE_STARTED', 'MILESTONE_COMPLETED', 'MANUAL_RELEASE')),
  status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'INVOICEABLE', 'INVOICED', 'PAID', 'OVERDUE', 'CANCELLED')),
  invoice_id VARCHAR(64),
  milestone_id VARCHAR(64) REFERENCES project_milestones(id),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_proposal ON payment_schedules(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_project ON payment_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules(status);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(64) UNIQUE NOT NULL,
  proposal_id VARCHAR(64) REFERENCES proposals(id),
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
  client_id VARCHAR(64) NOT NULL REFERENCES clients(id),
  representative_id VARCHAR(64) REFERENCES representatives(id),
  payment_schedule_id VARCHAR(64) REFERENCES payment_schedules(id),
  title TEXT NOT NULL,
  description TEXT,
  amount_minor BIGINT NOT NULL DEFAULT 0,
  amount_paid_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL CHECK (currency IN ('KES', 'NGN')),
  status VARCHAR(32) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
  due_date DATE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by VARCHAR(64) REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  invoice_id VARCHAR(64) NOT NULL REFERENCES invoices(id),
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
  amount_minor BIGINT NOT NULL,
  currency VARCHAR(8) NOT NULL CHECK (currency IN ('KES', 'NGN')),
  payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'CASH', 'OTHER_MANUAL', 'GATEWAY_SIMULATION')),
  verification_source VARCHAR(32) NOT NULL CHECK (verification_source IN (
    'MANUAL_VERIFICATION', 'BANK_TRANSFER_CONFIRMATION', 'GATEWAY_SIMULATION',
    'PAYSTACK_WEBHOOK', 'FLUTTERWAVE_WEBHOOK', 'M_PESA_CALLBACK'
  )),
  status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  reference VARCHAR(255) UNIQUE NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL,
  verified_by VARCHAR(64) NOT NULL REFERENCES users(id),
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);

-- Commission Events (Immutable Financial Facts)
CREATE TABLE IF NOT EXISTS commission_events (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) UNIQUE NOT NULL REFERENCES payments(id),
  invoice_id VARCHAR(64) NOT NULL REFERENCES invoices(id),
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
  proposal_id VARCHAR(64) REFERENCES proposals(id),
  representative_id VARCHAR(64) NOT NULL REFERENCES representatives(id),
  currency VARCHAR(8) NOT NULL CHECK (currency IN ('KES', 'NGN')),
  verified_amount_minor BIGINT NOT NULL,
  commission_rate_bps_at_time_of_payment INTEGER NOT NULL,
  calculated_commission_amount_minor BIGINT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'RECORDED' CHECK (status IN ('RECORDED', 'PROCESSED', 'FLAGGED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_events_rep ON commission_events(representative_id);
CREATE INDEX IF NOT EXISTS idx_commission_events_payment ON commission_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_commission_events_idempotency ON commission_events(idempotency_key);

-- Commissions
CREATE TABLE IF NOT EXISTS commissions (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
  representative_id VARCHAR(64) NOT NULL REFERENCES representatives(id),
  rate_bps INTEGER NOT NULL DEFAULT 2000,
  base_amount_minor BIGINT NOT NULL DEFAULT 0,
  commission_amount_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AVAILABLE', 'PROCESSING', 'PAID', 'CANCELLED', 'DISPUTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commission Ledger
CREATE TABLE IF NOT EXISTS commission_ledger (
  id VARCHAR(64) PRIMARY KEY,
  commission_id VARCHAR(64) REFERENCES commissions(id),
  representative_id VARCHAR(64) NOT NULL REFERENCES representatives(id),
  type VARCHAR(32) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'HOLD')),
  amount_minor BIGINT NOT NULL,
  currency VARCHAR(8) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'INFO',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
  recipient_id VARCHAR(64) REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id VARCHAR(64) NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id VARCHAR(64),
  metadata_json TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_leads_rep ON leads(representative_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_rep ON projects(representative_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_commissions_rep ON commissions(representative_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Ensure permissions for Supabase Studio and service roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
`;

export async function setupSupabaseDatabase() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    console.error('❌ Error: DIRECT_URL or DATABASE_URL must be configured with a PostgreSQL connection string.');
    console.error('   Example: postgresql://postgres.zmlaqqgjlqpzigrnxdsx:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres');
    throw new Error('Missing PostgreSQL connection string in DIRECT_URL or DATABASE_URL.');
  }

  console.log('⚡ Initializing CodeBridge Supabase PostgreSQL Database Setup...');
  const sql = postgres(dbUrl, {
    prepare: false,
    ssl: 'require',
    max: 1,
  });

  try {
    // 1. Create Schema: Tables, constraints, and indexes
    console.log('-> Applying PostgreSQL database schema (tables, foreign keys, constraints, and indexes)...');
    await sql.unsafe(POSTGRES_SCHEMA_SQL);
    console.log('   ✅ Successfully applied PostgreSQL schema statements and indexes.');

    // 2. Seed Countries (Nigeria and Kenya foundational records)
    console.log('-> Seeding foundational countries (Nigeria, Kenya)...');
    await sql`
      INSERT INTO countries (id, code, name, currency, phone_code, timezone, is_active)
      VALUES 
        ('c_ng', 'NG', 'Nigeria', 'NGN', '+234', 'Africa/Lagos', 1),
        ('c_ke', 'KE', 'Kenya', 'KES', '+254', 'Africa/Nairobi', 1)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        currency = EXCLUDED.currency,
        phone_code = EXCLUDED.phone_code,
        timezone = EXCLUDED.timezone,
        is_active = EXCLUDED.is_active;
    `;
    console.log('   ✅ Seeded Nigeria (NGN) and Kenya (KES).');

    // 3. Seed 14 Services Catalog Entries
    console.log('-> Seeding foundational 14 service catalog items...');
    for (const service of FOUNDATIONAL_SERVICES) {
      await sql`
        INSERT INTO services (id, code, name, description, category, base_price_minor, currency, is_active)
        VALUES (${service[0]}, ${service[1]}, ${service[2]}, ${service[3]}, ${service[4]}, ${service[5]}, ${service[6]}, ${service[7]})
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          base_price_minor = EXCLUDED.base_price_minor,
          currency = EXCLUDED.currency,
          is_active = EXCLUDED.is_active;
      `;
    }
    console.log('   ✅ Seeded 14 service catalog entries.');

    // 4. Seed Initial Super Admin (Credentials MUST come from environment variables)
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ CRITICAL: ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD must be configured.');
      console.error('   Production credentials must never be hardcoded.');
      throw new Error('Missing ADMIN_INITIAL_EMAIL or ADMIN_INITIAL_PASSWORD environment variables.');
    }

    if (adminPassword.length < 12) {
      console.error('❌ CRITICAL: ADMIN_INITIAL_PASSWORD must be at least 12 characters for production security.');
      throw new Error('ADMIN_INITIAL_PASSWORD must be at least 12 characters.');
    }

    console.log(`-> Provisioning Initial Super Admin (${adminEmail})...`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminUserId = 'u_superadmin_initial';

    const existingUsers = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;

    if (existingUsers.length === 0) {
      await sql`
        INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
        VALUES (${adminUserId}, ${adminEmail}, ${passwordHash}, 'SUPER_ADMIN', 'ACTIVE', 1, NOW(), NOW())
      `;
      await sql`
        INSERT INTO user_profiles (user_id, first_name, last_name, phone, country_id, timezone, updated_at)
        VALUES (${adminUserId}, 'CodeBridge', 'SuperAdmin', '', 'c_ng', 'Africa/Lagos', NOW())
        ON CONFLICT (user_id) DO NOTHING
      `;
      console.log(`   ✅ Initial Super Admin created for ${adminEmail}.`);
    } else {
      const existingId = existingUsers[0].id;
      await sql`
        UPDATE users
        SET password_hash = ${passwordHash}, role = 'SUPER_ADMIN', status = 'ACTIVE', email_verified = 1, updated_at = NOW()
        WHERE id = ${existingId}
      `;
      console.log(`   ℹ️ Existing user ${adminEmail} verified and updated as active SUPER_ADMIN.`);
    }

    console.log('\n✨ CodeBridge Supabase PostgreSQL Database Setup completed idempotently!');
    console.log('   No demo data, mock leads, mock proposals, or test transactions were seeded.');
  } finally {
    await sql.end({ timeout: 2 });
  }
}

// CLI runner
if (process.argv[1] && process.argv[1].includes('setup-supabase')) {
  setupSupabaseDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal Supabase setup error:', err);
      process.exit(1);
    });
}

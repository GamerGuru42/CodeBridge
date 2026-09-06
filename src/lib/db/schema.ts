// src/lib/db/schema.ts

export const CREATE_TABLES_SQL = `
-- Countries table (multi-country architecture: NG, KE, and future expansion)
CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g. 'NG', 'KE'
  name TEXT NOT NULL,
  currency TEXT NOT NULL, -- 'NGN', 'KES'
  phone_code TEXT NOT NULL, -- '+234', '+254'
  timezone TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Core Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'COUNTRY_MANAGER', 'REPRESENTATIVE', 'DEVELOPER', 'CLIENT')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')),
  google_id TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  country_id TEXT REFERENCES countries(id),
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  avatar_url TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Representatives (Tracks country assignment, approval status, and configurable commission rate)
CREATE TABLE IF NOT EXISTS representatives (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_id TEXT NOT NULL REFERENCES countries(id),
  approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')),
  commission_rate_bps INTEGER NOT NULL DEFAULT 2000, -- 2000 basis points = 20.00%
  approved_at TEXT,
  approved_by TEXT REFERENCES users(id),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id TEXT,
  company_name TEXT NOT NULL,
  industry TEXT,
  country_id TEXT NOT NULL REFERENCES countries(id),
  representative_id TEXT REFERENCES representatives(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Leads (Lead lifecycle: NEW -> CONTACTED -> QUALIFIED -> REQUIREMENTS_COLLECTED -> PROPOSAL -> WON / LOST)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country_id TEXT NOT NULL REFERENCES countries(id),
  business_type TEXT NOT NULL,
  requirements TEXT NOT NULL,
  estimated_budget_minor INTEGER NOT NULL DEFAULT 0, -- Minor currency units (no float)
  currency TEXT NOT NULL DEFAULT 'NGN',
  representative_id TEXT REFERENCES representatives(id),
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'REQUIREMENTS_COLLECTED', 'PROPOSAL', 'WON', 'LOST')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Services Catalog (14 business digital products)
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client_id TEXT NOT NULL REFERENCES clients(id),
  representative_id TEXT REFERENCES representatives(id),
  lead_id TEXT REFERENCES leads(id),
  service_id TEXT REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'PLANNING' CHECK (status IN (
    'DRAFT', 'AWAITING_PAYMENT', 'PLANNING', 'DEVELOPMENT', 'INTERNAL_REVIEW',
    'CLIENT_REVIEW', 'REVISION', 'APPROVED', 'DEPLOYMENT',
    'COMPLETED', 'MAINTENANCE'
  )),
  payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID')),
  budget_minor INTEGER NOT NULL DEFAULT 0,
  total_paid_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  country_id TEXT NOT NULL REFERENCES countries(id),
  start_date TEXT,
  started_at TEXT,
  target_completion_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Project Members (Assigning developers, managers to projects)
CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, user_id)
);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Proposals (Phase 2A Commercial Engine: Version-safe, Deliverables, Status Lifecycle)
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  proposal_number TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_current INTEGER NOT NULL DEFAULT 1,
  lead_id TEXT REFERENCES leads(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  project_id TEXT REFERENCES projects(id),
  representative_id TEXT REFERENCES representatives(id),
  title TEXT NOT NULL,
  scope_of_work TEXT NOT NULL,
  deliverables_json TEXT NOT NULL DEFAULT '[]',
  payment_structure_type TEXT NOT NULL DEFAULT 'FULL_UPFRONT' CHECK (payment_structure_type IN ('FULL_UPFRONT', 'DEPOSIT_MILESTONES', 'CUSTOM')),
  payment_schedule_json TEXT NOT NULL DEFAULT '[]',
  total_amount_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'CLIENT_APPROVED', 'CLIENT_REJECTED', 'EXPIRED', 'CANCELLED')),
  valid_until TEXT,
  terms_notes TEXT,
  rejection_reason TEXT,
  created_by TEXT REFERENCES users(id),
  sent_at TEXT,
  viewed_at TEXT,
  approved_at TEXT,
  approved_version INTEGER,
  rejected_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(proposal_number, version)
);

CREATE INDEX IF NOT EXISTS idx_proposals_client ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_number ON proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposals_rep ON proposals(representative_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Payment Schedules (Phase 2B: Milestone/Custom breakdown with explicit billing triggers)
CREATE TABLE IF NOT EXISTS payment_schedules (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('FULL_UPFRONT', 'DEPOSIT_MILESTONES', 'CUSTOM')),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  percentage_bps INTEGER NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KES', 'NGN')),
  is_required_to_start INTEGER NOT NULL DEFAULT 0,
  billing_trigger TEXT NOT NULL CHECK (billing_trigger IN ('UPFRONT_APPROVAL', 'MILESTONE_STARTED', 'MILESTONE_COMPLETED', 'MANUAL_RELEASE')),
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'INVOICEABLE', 'INVOICED', 'PAID', 'OVERDUE', 'CANCELLED')),
  invoice_id TEXT REFERENCES invoices(id),
  milestone_id TEXT REFERENCES project_milestones(id),
  due_date TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_proposal ON payment_schedules(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_project ON payment_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules(status);

-- Invoices (Phase 2B Commercial Billing Engine)
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  proposal_id TEXT REFERENCES proposals(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  representative_id TEXT REFERENCES representatives(id),
  payment_schedule_id TEXT REFERENCES payment_schedules(id),
  title TEXT NOT NULL,
  description TEXT,
  amount_minor INTEGER NOT NULL DEFAULT 0,
  amount_paid_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL CHECK (currency IN ('KES', 'NGN')),
  status TEXT NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
  due_date TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  paid_at TEXT,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Payments (Phase 2B: Discrete Verified Financial Transactions)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KES', 'NGN')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'CASH', 'OTHER_MANUAL', 'GATEWAY_SIMULATION')),
  verification_source TEXT NOT NULL CHECK (verification_source IN (
    'MANUAL_VERIFICATION', 'BANK_TRANSFER_CONFIRMATION', 'GATEWAY_SIMULATION',
    'PAYSTACK_WEBHOOK', 'FLUTTERWAVE_WEBHOOK', 'M_PESA_CALLBACK'
  )),
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  reference TEXT UNIQUE NOT NULL,
  verified_at TEXT NOT NULL,
  verified_by TEXT NOT NULL REFERENCES users(id),
  verification_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);

-- Commission Events (Phase 2B -> Phase 2D Handoff: Immutable Financial Facts)
CREATE TABLE IF NOT EXISTS commission_events (
  id TEXT PRIMARY KEY,
  payment_id TEXT UNIQUE NOT NULL REFERENCES payments(id),
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  proposal_id TEXT REFERENCES proposals(id),
  representative_id TEXT NOT NULL REFERENCES representatives(id),
  currency TEXT NOT NULL CHECK (currency IN ('KES', 'NGN')),
  verified_amount_minor INTEGER NOT NULL,
  commission_rate_bps_at_time_of_payment INTEGER NOT NULL,
  calculated_commission_amount_minor INTEGER NOT NULL,
  verified_at TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECORDED' CHECK (status IN ('RECORDED', 'PROCESSED', 'FLAGGED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_commission_events_rep ON commission_events(representative_id);
CREATE INDEX IF NOT EXISTS idx_commission_events_payment ON commission_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_commission_events_idempotency ON commission_events(idempotency_key);

-- Commissions (Tracks calculated representative commissions; NO live money movement)
CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  representative_id TEXT NOT NULL REFERENCES representatives(id),
  rate_bps INTEGER NOT NULL DEFAULT 2000, -- e.g. 2000 = 20%
  base_amount_minor INTEGER NOT NULL DEFAULT 0,
  commission_amount_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AVAILABLE', 'PROCESSING', 'PAID', 'CANCELLED', 'DISPUTED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Commission Ledger (Audit ledger of commission credits and balances)
CREATE TABLE IF NOT EXISTS commission_ledger (
  id TEXT PRIMARY KEY,
  commission_id TEXT REFERENCES commissions(id),
  representative_id TEXT NOT NULL REFERENCES representatives(id),
  type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'HOLD')),
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Messages / Project Discussions
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  recipient_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Project Documents / Files
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id TEXT NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- System Audit Logs (Mandatory for tracking sensitive administrative & role changes)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Performance Indexes
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
`;

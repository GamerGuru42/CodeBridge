// src/lib/db/types.ts

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'COUNTRY_MANAGER'
  | 'REPRESENTATIVE'
  | 'DEVELOPER'
  | 'CLIENT';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type RepApprovalStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'REQUIREMENTS_COLLECTED'
  | 'PROPOSAL'
  | 'WON'
  | 'LOST';

export type ProjectStatus =
  | 'DRAFT'
  | 'AWAITING_PAYMENT'
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'INTERNAL_REVIEW'
  | 'CLIENT_REVIEW'
  | 'REVISION'
  | 'APPROVED'
  | 'DEPLOYMENT'
  | 'COMPLETED'
  | 'MAINTENANCE';

export type CommissionStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'PROCESSING'
  | 'PAID'
  | 'CANCELLED'
  | 'DISPUTED';

export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'CLIENT_APPROVED'
  | 'CLIENT_REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentStructureType = 'FULL_UPFRONT' | 'DEPOSIT_MILESTONES' | 'CUSTOM';

export type PaymentScheduleStatus =
  | 'SCHEDULED'
  | 'INVOICEABLE'
  | 'INVOICED'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type BillingTrigger =
  | 'UPFRONT_APPROVAL'
  | 'MILESTONE_STARTED'
  | 'MILESTONE_COMPLETED'
  | 'MANUAL_RELEASE';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'OTHER_MANUAL'
  | 'GATEWAY_SIMULATION';

export type VerificationSource =
  | 'MANUAL_VERIFICATION'
  | 'BANK_TRANSFER_CONFIRMATION'
  | 'GATEWAY_SIMULATION'
  | 'PAYSTACK_WEBHOOK'
  | 'FLUTTERWAVE_WEBHOOK'
  | 'M_PESA_CALLBACK';

export type CurrencyCode = 'NGN' | 'KES' | 'USD';

export interface Country {
  id: string;
  code: string; // NG, KE
  name: string; // Nigeria, Kenya
  currency: CurrencyCode;
  phone_code: string; // +234, +254
  timezone: string; // Africa/Lagos, Africa/Nairobi
  is_active: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  email_verified: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_id: string;
  timezone: string;
  avatar_url?: string;
  updated_at: string;
}

export interface Representative {
  id: string;
  user_id: string;
  country_id: string;
  approval_status: RepApprovalStatus;
  commission_rate_bps: number; // 2000 = 20.00%
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  lead_id?: string;
  company_name: string;
  industry?: string;
  country_id: string;
  representative_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country_id: string;
  business_type: string;
  requirements: string;
  estimated_budget_minor: number; // In minor currency units (e.g. cents/kobo)
  currency: CurrencyCode;
  representative_id?: string;
  status: LeadStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  base_price_minor: number;
  currency: CurrencyCode;
  is_active: number;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  client_id: string;
  representative_id?: string;
  lead_id?: string;
  service_id?: string;
  status: ProjectStatus;
  payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  budget_minor: number;
  total_paid_minor: number;
  currency: CurrencyCode;
  country_id: string;
  start_date?: string;
  started_at?: string;
  target_completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  order_index: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  due_date?: string;
  created_at: string;
}

export interface PaymentSchedule {
  id: string;
  proposal_id: string;
  project_id?: string;
  schedule_type: PaymentStructureType;
  name: string;
  order_index: number;
  percentage_bps: number; // 10000 = 100.00%
  amount_minor: number;
  currency: CurrencyCode;
  is_required_to_start: number; // 1 or 0
  billing_trigger: BillingTrigger;
  status: PaymentScheduleStatus;
  invoice_id?: string;
  milestone_id?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string; // e.g. INV-KES-2026-0001
  proposal_id?: string;
  project_id: string;
  client_id: string;
  representative_id?: string;
  payment_schedule_id?: string;
  title: string;
  description?: string;
  amount_minor: number;
  amount_paid_minor: number;
  currency: CurrencyCode;
  status: InvoiceStatus;
  due_date: string;
  issued_at: string;
  paid_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  project_id: string;
  amount_minor: number;
  currency: CurrencyCode;
  payment_method: PaymentMethod;
  verification_source: VerificationSource;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  reference: string;
  verified_at: string;
  verified_by: string;
  verification_notes?: string;
  created_at: string;
}

export interface CommissionEvent {
  id: string;
  payment_id: string;
  invoice_id: string;
  project_id: string;
  proposal_id?: string;
  representative_id: string;
  currency: CurrencyCode;
  verified_amount_minor: number;
  commission_rate_bps_at_time_of_payment: number;
  calculated_commission_amount_minor: number;
  verified_at: string;
  idempotency_key: string; // e.g. COMMISSION_PAYMENT_<payment_id>
  status: 'RECORDED' | 'PROCESSED' | 'FLAGGED';
  created_at: string;
}

export interface Commission {
  id: string;
  project_id: string;
  representative_id: string;
  rate_bps: number; // 2000 = 20%
  base_amount_minor: number;
  commission_amount_minor: number;
  currency: CurrencyCode;
  status: CommissionStatus;
  created_at: string;
  updated_at: string;
}

export interface CommissionLedger {
  id: string;
  commission_id: string;
  representative_id: string;
  type: 'CREDIT' | 'DEBIT' | 'HOLD';
  amount_minor: number;
  currency: CurrencyCode;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata_json?: string;
  ip_address?: string;
  created_at: string;
}

export interface Proposal {
  id: string;
  proposal_number: string;
  version: number;
  is_current: number; // 1 for active version, 0 for superseded
  lead_id?: string;
  client_id: string;
  project_id?: string;
  representative_id?: string;
  title: string;
  scope_of_work: string;
  deliverables_json: string; // JSON array of string deliverables
  payment_structure_type?: PaymentStructureType;
  payment_schedule_json?: string; // JSON array of schedule items
  total_amount_minor: number;
  currency: CurrencyCode;
  status: ProposalStatus;
  valid_until?: string;
  terms_notes?: string;
  rejection_reason?: string;
  created_by?: string;
  sent_at?: string;
  viewed_at?: string;
  approved_at?: string;
  approved_version?: number;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}


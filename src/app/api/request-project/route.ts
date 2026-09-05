// src/app/api/request-project/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db/connection';
import { recordAuditLog } from '@/lib/auth/session';
import { CurrencyCode } from '@/lib/db/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      contactPerson,
      email,
      phone,
      countryCode,
      businessType,
      serviceCategory,
      requirements,
      estimatedBudget,
      currency,
    } = body;

    if (!businessName || !contactPerson || !email || !requirements) {
      return NextResponse.json(
        { error: 'Please provide business name, contact person, email, and requirements.' },
        { status: 400 }
      );
    }

    const targetCode = (countryCode || 'KE').toUpperCase();
    const country = await queryOne('SELECT id, currency FROM countries WHERE code = ?', [targetCode]);
    const countryId = country ? country.id : 'c_ke';
    const chosenCurrency: CurrencyCode = (currency || country?.currency || 'KES') as CurrencyCode;

    const budgetNumber = Number(estimatedBudget) || 0;
    const estimatedBudgetMinor = Math.round(budgetNumber * 100);

    const leadId = `lead_pub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    await execute(`
      INSERT INTO leads (
        id, business_name, contact_person, email, phone,
        country_id, business_type, requirements, estimated_budget_minor,
        currency, representative_id, status, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'NEW', ?, datetime('now'), datetime('now'))
    `, [
      leadId,
      businessName.trim(),
      contactPerson.trim(),
      email.trim().toLowerCase(),
      phone || '',
      countryId,
      businessType || serviceCategory || 'Digital Product',
      requirements.trim(),
      estimatedBudgetMinor,
      chosenCurrency,
      `Submitted through CodeBridge Public Web Scoping Form (Service: ${serviceCategory || 'General'})`
    ]);

    await recordAuditLog({
      action: 'PUBLIC_LEAD_SUBMISSION',
      entity: 'leads',
      entityId: leadId,
      metadata: { businessName, country: targetCode, currency: chosenCurrency },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
    });

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Thank you! Your project request has been submitted to the CodeBridge engineering team.'
    }, { status: 201 });
  } catch (err: any) {
    console.error('Project request error:', err);
    return NextResponse.json({ error: 'Failed to submit project request.' }, { status: 500 });
  }
}

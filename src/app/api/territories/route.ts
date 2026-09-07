// src/app/api/territories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { query, queryOne, execute } from '@/lib/db/connection';

export async function GET() {
  try {
    const territories = await query<any>(`
      SELECT id, country_name, currency, default_payout_method, default_commission_rate_bps, is_active, direct_admin, created_at
      FROM territories
      ORDER BY country_name ASC
    `);

    return NextResponse.json({ success: true, territories });
  } catch (err: any) {
    console.error('Failed to fetch territories:', err);
    return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, countryName, currency, defaultPayoutMethod, defaultCommissionRateBps, isActive } = body;

    if (!id || !countryName || !currency) {
      return NextResponse.json({ error: 'ID, Country Name, and Currency are required.' }, { status: 400 });
    }

    const territoryId = id.trim().toUpperCase();
    const payoutMethod = defaultPayoutMethod || 'BANK';
    const rateBps = defaultCommissionRateBps !== undefined ? Number(defaultCommissionRateBps) : 2000;
    const active = isActive !== undefined ? (isActive ? 1 : 0) : 1;

    await execute(`
      INSERT INTO territories (
        id, country_name, currency, default_payout_method, default_commission_rate_bps, is_active, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (id) DO UPDATE SET
        country_name = EXCLUDED.country_name,
        currency = EXCLUDED.currency,
        default_payout_method = EXCLUDED.default_payout_method,
        default_commission_rate_bps = EXCLUDED.default_commission_rate_bps,
        is_active = EXCLUDED.is_active
    `, [territoryId, countryName.trim(), currency.trim().toUpperCase(), payoutMethod, rateBps, active]);

    await recordAuditLog({
      userId: session.userId,
      action: 'TERRITORY_CONFIGURED',
      entity: 'territories',
      entityId: territoryId,
      metadata: { countryName, currency, payoutMethod, rateBps, active },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      territory: {
        id: territoryId,
        country_name: countryName,
        currency: currency.toUpperCase(),
        default_payout_method: payoutMethod,
        default_commission_rate_bps: rateBps,
        is_active: active,
      },
    });
  } catch (err: any) {
    console.error('Failed to configure territory:', err);
    return NextResponse.json({ error: 'Failed to configure territory' }, { status: 500 });
  }
}

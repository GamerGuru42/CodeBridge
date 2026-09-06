import { NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import type { Service } from '@/lib/db/types';

export async function GET() {
  try {
    const services = await query<Service>(
      `SELECT * FROM services WHERE is_active = 1 ORDER BY category, name`
    );
    
    return NextResponse.json({ success: true, data: services });
  } catch (err: any) {
    console.error('Failed to fetch services:', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL! || 'https://xsxbeihsavosrxjyzmga.supabase.co',
  process.env.SUPABASE_SERVICE_KEY! || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU2MjY4MSwiZXhwIjoyMDY3MTM4NjgxfQ.RZ-dxp7GSWBY5ExGejKViMFb6FRtcagDdDtNE6w8CV4'
);

export async function POST(req: Request) {
  const { referrerId } = await req.json();

  if (!referrerId) {
    return NextResponse.json({ error: 'Missing referrerId' }, { status: 400 });
  }

  // زيادة عدد الإحالات
   const { data, error } = await supabase
    .from('users')
    .update({ referrals: (supabase.raw('referrals + 1') as any) })
    .eq('id', referrerId)
    .select();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

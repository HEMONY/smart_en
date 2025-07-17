import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  const { referrerId } = await req.json();

  if (!referrerId) {
    return NextResponse.json({ error: 'Missing referrerId' }, { status: 400 });
  }

  // زيادة عدد الإحالات
  const { data, error } = await supabase
    .from('users')
    .update({ referrals: supabase.rpc('increment_referrals', { id_input: referrerId }) }) // إن استخدمت فانكشن
    .eq('telegram_id', referrerId) // أو id حسب العمود
    .select();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

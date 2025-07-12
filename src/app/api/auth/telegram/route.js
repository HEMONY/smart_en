import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { parse } from 'querystring';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

function verifyTelegramInitData(initDataRaw: string) {
  const params = parse(initDataRaw);
  const hash = params.hash as string;
  const dataCheckString = Object.keys(params)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const authDate = parseInt(params.auth_date as string, 10);
  if (Math.floor(Date.now()/1000) - authDate > 86400) return null;
  return hmac === hash ? params : null;
}

export async function POST(request: Request) {
  const { initData } = await request.json().catch(() => ({}));
  if (!initData) return NextResponse.json({ ok: false, error: 'initData missing' }, { status:400 });
  const verified = verifyTelegramInitData(initData);
  if (!verified || !verified.id) return NextResponse.json({ ok: false, error: 'Invalid initData' }, { status:403 });
  const id = Number(verified.id);

  // تسجيل مستخدم جديد أو البحث عنه
  const { data: existing, error: selErr } = await supabase
    .from('users').select('*').eq('telegram_id', id).single();

  let user = existing;
  if (selErr && selErr.code === 'PGRST116') {
    const newUser = {
      telegram_id: id,
      username: verified.username as string || `user${id}`,
      first_name: verified.first_name as string || '',
      last_name: verified.last_name as string || '',
      photo_url: verified.photo_url as string || '',
      wallet_address: 'EQC'+crypto.randomBytes(32).toString('hex'),
    };
    const { data: created, error: insErr } = await supabase.from('users').insert([newUser]).select().single();
    if (insErr) console.error(insErr);
    user = created;
  }

  return NextResponse.json({ ok: true, user });
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/login?error=use_webapp_post', request.url));
}

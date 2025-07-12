import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { parse } from 'querystring';

// إعداد Supabase
const supabase = createClient(
  'https://xsxbeihsavosrxjyzmga.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o'
);

// متغيرات بيئة
const TELEGRAM_BOT_TOKEN = '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';

function verifyTelegramInitData(initDataRaw) {
  const parsed = parse(initDataRaw);
  const hash = parsed.hash;

  const dataCheckString = Object.keys(parsed)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${parsed[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // التحقق من التوقيت
  const authDate = parseInt(parsed.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) return false;

  return hmac === hash ? parsed : false;
}

export async function POST(req) {
  try {
    const { initData } = await req.json();
    if (!initData) {
      return NextResponse.json({ ok: false, error: 'initData missing' }, { status: 400 });
    }

    const userData = verifyTelegramInitData(initData);
    if (!userData || !userData.id) {
      return NextResponse.json({ ok: false, error: 'Invalid initData' }, { status: 403 });
    }

    // التحقق من وجود المستخدم أو إنشاءه
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userData.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const newUser = {
        telegram_id: userData.id,
        username: userData.username || `user${userData.id}`,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        photo_url: userData.photo_url || '',
        wallet_address: generateWalletAddress()
      };

      const { data: createdUser, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        console.error('Insert Error:', insertError);
        return NextResponse.json({ ok: false, error: 'DB insert failed' }, { status: 500 });
      }

      user = createdUser;
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ ok: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  // توجيه المستخدم إذا حاول تسجيل الدخول عبر المتصفح
  return NextResponse.redirect(new URL('/login?error=use_webapp_post', req.url));
}

function generateWalletAddress() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'EQC';
  for (let i = 0; i < 45; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

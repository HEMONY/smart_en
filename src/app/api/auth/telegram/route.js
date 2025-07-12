import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import querystring from 'querystring';

const TELEGRAM_BOT_TOKEN = '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';

const supabaseUrl = 'https://xsxbeihsavosrxjyzmga.supabase.co';
const supabaseServiceKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o'; // ← استخدم المفتاح الكامل كما فعلت
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ التحقق من initData من Telegram WebApp
function verifyInitData(initDataRaw) {
  try {
    const [dataPart, hash] = initDataRaw.split('&hash=');
    const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataPart).digest('hex');

    return calculatedHash === hash;
  } catch (err) {
    console.error('Error verifying initData:', err);
    return false;
  }
}

// ✅ استخراج بيانات المستخدم من initData
function parseInitData(initDataRaw) {
  const [dataPart] = initDataRaw.split('&hash=');
  const parsed = querystring.parse(dataPart);
  const user = parsed.user ? JSON.parse(parsed.user) : null;
  return user;
}

// ✅ POST = استقبال initData من WebApp
export async function POST(request) {
  try {
    const body = await request.json();

    const initData = body?.initData;
    if (!initData) {
      console.warn('initData is missing from request.');
      return NextResponse.json({ ok: false, error: 'Missing initData' }, { status: 400 });
    }

    const params = Object.fromEntries(new URLSearchParams(initData).entries());

    if (!verifyTelegramData(params)) {
      console.warn('Telegram data verification failed.');
      return NextResponse.json({ ok: false, error: 'Telegram auth failed' }, { status: 403 });
    }

    const telegramUserData = JSON.parse(params.user || '{}');

    // --- البحث عن المستخدم أو إنشاءه في Supabase ---
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUserData.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const walletAddress = generateWalletAddress();
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: telegramUserData.id,
            username: telegramUserData.username || `user${telegramUserData.id}`,
            wallet_address: walletAddress,
            first_name: telegramUserData.first_name,
            last_name: telegramUserData.last_name,
            photo_url: telegramUserData.photo_url
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Supabase insert error:', createError);
        return NextResponse.json({ ok: false, error: 'User creation failed' }, { status: 500 });
      }

      user = newUser;
    }

    return NextResponse.json({ ok: true, user });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}


// WebApp لا يستخدم GET فعليًا ولكن نحافظ عليها للمرونة
export async function GET(request) {
  return NextResponse.redirect(new URL('/login?error=use_webapp_post', request.url), 302);
}

// توليد عنوان محفظة عشوائي
function generateWalletAddress() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'EQC';
  for (let i = 0; i < 45; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

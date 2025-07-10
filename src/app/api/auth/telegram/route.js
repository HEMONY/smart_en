import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ✅ إعداد Supabase
const supabase = createClient(
  'https://xsxbeihsavosrxjyzmga.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o'
);

// ✅ توكن البوت
const TELEGRAM_BOT_TOKEN = '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';

// ✅ التحقق من صحة بيانات Telegram
function verifyTelegramData(data) {
  const receivedHash = data.hash;
  if (!receivedHash) return false;

  const dataCheckString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const authDate = parseInt(data.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) return false;

  return calculatedHash === receivedHash;
}

// ✅ معالجة طلب GET من Telegram Login Widget
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    console.log("✅ Telegram Login Data:", params);

    if (!verifyTelegramData(params)) {
      console.warn('❌ تحقق Telegram فشل');
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url), 302);
    }

    const telegram_id = params.id;
    const first_name = params.first_name;

    // ✅ تحقق من وجود المستخدم
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single();

    // ✅ إن لم يوجد، قم بإنشائه
    if (error && error.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ telegram_id, first_name }])
        .select()
        .single();

      if (createError) {
        console.error('❌ خطأ في إنشاء المستخدم:', createError);
        return NextResponse.redirect(new URL('/login?error=user_creation_failed', request.url), 302);
      }

      user = newUser;
    }

    // ✅ تسجيل دخول ناجح — تحويل إلى لوحة التحكم
    return NextResponse.redirect(new URL('/dashboard', request.url), 302);

  } catch (error) {
    console.error('❌ خطأ في السيرفر:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url), 302);
  }
}

// ✅ دعم POST إن وُجد
export async function POST(request) {
  return GET(request);
}

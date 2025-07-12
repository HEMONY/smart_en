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
    const initDataRaw = body.initData;

    if (!initDataRaw || !verifyInitData(initDataRaw)) {
      console.warn('Telegram WebApp initData verification failed.');
      return NextResponse.redirect(new URL('/login?error=invalid_telegram_data', request.url), 302);
    }

    const telegramUser = parseInitData(initDataRaw);
    if (!telegramUser || !telegramUser.id) {
      console.error('Missing Telegram user data.');
      return NextResponse.redirect(new URL('/login?error=missing_user_data', request.url), 302);
    }

    // تحقق من وجود المستخدم
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();

    // إذا لم يوجد، أنشئ مستخدم جديد
    if (error && error.code === 'PGRST116') {
      const walletAddress = generateWalletAddress();
      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: telegramUser.id,
            username: telegramUser.username || `user${telegramUser.id}`,
            wallet_address: walletAddress,
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || '',
            photo_url: telegramUser.photo_url || ''
          }
        ])
        .select()
        .single();

      if (insertErr) {
        console.error('Insert error:', insertErr);
        return NextResponse.redirect(new URL('/login?error=insert_failed', request.url), 302);
      }

      user = newUser;
    } else if (error) {
      console.error('Select error:', error);
      return NextResponse.redirect(new URL('/login?error=db_error', request.url), 302);
    } else {
      // تحديث بيانات موجودة
      const updates = {};
      if (telegramUser.username && telegramUser.username !== user.username) updates.username = telegramUser.username;
      if (telegramUser.first_name && telegramUser.first_name !== user.first_name) updates.first_name = telegramUser.first_name;
      if (telegramUser.last_name && telegramUser.last_name !== user.last_name) updates.last_name = telegramUser.last_name;
      if (telegramUser.photo_url && telegramUser.photo_url !== user.photo_url) updates.photo_url = telegramUser.photo_url;

      if (Object.keys(updates).length > 0) {
        await supabase.from('users').update(updates).eq('id', user.id);
      }
    }

    // ✅ إعادة التوجيه إلى لوحة التحكم
    return NextResponse.redirect(new URL('/dashboard', request.url), 302);

  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url), 302);
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

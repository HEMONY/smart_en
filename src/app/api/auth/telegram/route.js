import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// --- Telegram API Credentials (يفضل نقلها إلى .env) ---
const TELEGRAM_API_ID = '20942401';
const TELEGRAM_BOT_TOKEN = '7620357455:AAFZKGpQUrC7LvQgTzHSrAH4x1IbjEkDhDM';

// إعداد عميل Supabase
const supabaseUrl = 'https://xsxbeihsavosrxjyzmga.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o';// اختصرنا المفتاح للخصوصية
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ التحقق البسيط من وجود user_id و auth_code فقط
function verifyTelegramData(data) {
  if (!data || !data.user_id || !data.auth_code) {
    console.warn("Missing required fields.");
    return false;
  }

  const authDate = parseInt(data.auth_code, 10);
  if (isNaN(authDate)) {
    console.warn("Invalid auth_code.");
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    console.warn("auth_code is outdated.");
    return false;
  }

  return true;
}

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    console.log("🔍 Query Params:", queryParams);

    if (!verifyTelegramData(queryParams)) {
      console.warn('Telegram data verification failed.');
      const errorUrl = new URL('/login?error=telegram_auth_failed', request.url);
      return NextResponse.redirect(errorUrl.toString(), 302);
    }

    const telegramUserData = queryParams;

    // البحث عن المستخدم
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUserData.user_id)
      .single();

    // المستخدم غير موجود → إنشاء
    if (error && error.code === 'PGRST116') {
      const walletAddress = generateWalletAddress();

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: telegramUserData.user_id,
            username: telegramUserData.username || `user${telegramUserData.user_id}`,
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
        const errorUrl = new URL('/login?error=user_creation_failed', request.url);
        return NextResponse.redirect(errorUrl.toString(), 302);
      }

      user = newUser;
    } else if (error) {
      console.error('Supabase select error:', error);
      const errorUrl = new URL('/login?error=database_error', request.url);
      return NextResponse.redirect(errorUrl.toString(), 302);
    } else {
      // تحديث بيانات المستخدم في حال وجود تغييرات
      const updates = {};
      if (telegramUserData.username && user.username !== telegramUserData.username) updates.username = telegramUserData.username;
      if (telegramUserData.first_name && user.first_name !== telegramUserData.first_name) updates.first_name = telegramUserData.first_name;
      if (telegramUserData.last_name && user.last_name !== telegramUserData.last_name) updates.last_name = telegramUserData.last_name;
      if (telegramUserData.photo_url && user.photo_url !== telegramUserData.photo_url) updates.photo_url = telegramUserData.photo_url;

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);
        if (updateError) {
          console.error('Supabase update error:', updateError);
        }
      }
    }

    // إعادة التوجيه للوحة التحكم
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error('Server error:', error);
    const errorUrl = new URL('/login?error=server_error', request.url);
    return NextResponse.redirect(errorUrl.toString(), 302);
  }
}

// دعم GET لأن Telegram login widget يرسل الطلب على هيئة GET
export async function GET(request) {
  return await POST(request);
}

// توليد عنوان محفظة وهمي (ينبغي تغييره في الإنتاج)
function generateWalletAddress() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'EQC';
  for (let i = 0; i < 45; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

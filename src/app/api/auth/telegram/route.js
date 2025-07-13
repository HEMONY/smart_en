import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// --- Telegram API Credentials ---
const TELEGRAM_API_ID = '20942401';
const TELEGRAM_BOT_TOKEN = '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';

// إعداد عميل Supabase
const supabaseUrl = 'https://xsxbeihsavosrxjyzmga.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o'; // (اختصرته لأمانك)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// تجاهل التحقق من hash مؤقتًا - لأغراض الفحص فقط

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    console.log('🔍 queryParams المستلمة من Telegram:', queryParams);

    const telegramUserData = queryParams;

    // 🟡 محاولة البحث عن المستخدم
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUserData.user_id)
      .single();

    console.log('📦 نتيجة البحث في Supabase:', { user, error });

    // 🔴 إذا لم يكن المستخدم موجودًا → أنشئه
    if (error && error.code === 'PGRST116') {
      const walletAddress = generateWalletAddress();

      console.log('🆕 إنشاء مستخدم جديد مع البيانات:', {
        telegram_id: telegramUserData.user_id,
        username: telegramUserData.username || `user${telegramUserData.user_id}`,
        wallet_address: walletAddress,
        first_name: telegramUserData.first_name,
        last_name: telegramUserData.last_name,
        photo_url: telegramUserData.photo_url
      });

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
        console.error('❌ خطأ أثناء إنشاء المستخدم في Supabase:', createError);
        const errorUrl = new URL('/login?error=user_creation_failed', request.url);
        return NextResponse.redirect(errorUrl.toString(), 302);
      }

      console.log('✅ تم إنشاء المستخدم الجديد:', newUser);
      user = newUser;
    } else if (error) {
      console.error('❌ خطأ أثناء جلب المستخدم من Supabase:', error);
      const errorUrl = new URL('/login?error=database_error', request.url);
      return NextResponse.redirect(errorUrl.toString(), 302);
    } else {
      // 🟢 المستخدم موجود - تحديث بياناته إذا تغيرت
      const updates = {};
      if (telegramUserData.username && user.username !== telegramUserData.username) updates.username = telegramUserData.username;
      if (telegramUserData.first_name && user.first_name !== telegramUserData.first_name) updates.first_name = telegramUserData.first_name;
      if (telegramUserData.last_name && user.last_name !== telegramUserData.last_name) updates.last_name = telegramUserData.last_name;
      if (telegramUserData.photo_url && user.photo_url !== telegramUserData.photo_url) updates.photo_url = telegramUserData.photo_url;

      if (Object.keys(updates).length > 0) {
        console.log('🔁 تحديث بيانات المستخدم:', updates);

        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);

        if (updateError) {
          console.error('⚠️ خطأ أثناء تحديث بيانات المستخدم:', updateError);
        } else {
          console.log('✅ تم تحديث بيانات المستخدم بنجاح');
        }
      }
    }

    const redirectUrl = new URL('/dashboard', request.url);
    console.log('✅ إعادة التوجيه إلى:', redirectUrl.toString());

    return NextResponse.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error('🔥 خطأ غير متوقع في الخادم:', error);
    const errorUrl = new URL('/login?error=server_error', request.url);
    return NextResponse.redirect(errorUrl.toString(), 302);
  }
}

export async function GET(request) {
  return await POST(request);
}

function generateWalletAddress() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'EQC';
  for (let i = 0; i < 45; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

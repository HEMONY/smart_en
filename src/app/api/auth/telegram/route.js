// app/api/auth/telegram/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// القيم الثابتة (يجب تغييرها لقيمك الفعلية)
const TELEGRAM_BOT_TOKEN = '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';
const TELEGRAM_API_ID = '20942401';
const SUPABASE_URL = 'https://xsxbeihsavosrxjyzmga.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifyTelegramData(data) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram Bot Token is missing!');
    return false;
  }

  const receivedHash = data.hash;
  if (!receivedHash) {
    console.error('No hash received from Telegram');
    return false;
  }

  // إعداد سلسلة التحقق من البيانات
  const dataCheckString = Object.keys(data)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');

  try {
    // إنشاء مفتاح سري من توكن البوت
    const secretKey = crypto.createHash('sha256')
      .update(TELEGRAM_BOT_TOKEN)
      .digest();

    // حساب الهاش المتوقع
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // التحقق من انتهاء الصلاحية (1 يوم كحد أقصى)
    const authDate = parseInt(data.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    const isNotExpired = (now - authDate) < 86400;

    if (!isNotExpired) {
      console.warn('Telegram data is expired');
      return false;
    }

    return calculatedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    console.log('Telegram auth data received:', params);

    // التحقق من صحة البيانات
    if (!verifyTelegramData(params)) {
      console.error('Telegram data verification failed');
      return NextResponse.redirect(new URL(
        '/login?error=telegram_auth_failed',
        request.url
      ));
    }

    // البحث عن المستخدم في قاعدة البيانات
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', params.id)
      .maybeSingle();

    if (userError) {
      console.error('Supabase user query error:', userError);
      throw userError;
    }

    let currentUser = user;

    // إذا لم يكن المستخدم موجوداً، نقوم بإنشائه
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: params.id,
          username: params.username || `user_${params.id}`,
          first_name: params.first_name || '',
          last_name: params.last_name || '',
          photo_url: params.photo_url || '',
          auth_date: new Date(parseInt(params.auth_date) * 1000).toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Supabase user creation error:', createError);
        throw createError;
      }

      currentUser = newUser;
    }

    // إنشاء جلسة للمستخدم (مثال)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${params.id}@telegram.user`,
      password: params.id // في الإنتاج استخدم طريقة أكثر أماناً
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      throw authError;
    }

    // إعادة توجيه ناجحة إلى لوحة التحكم
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // يمكنك إضافة كوكيز الجلسة هنا إذا لزم الأمر
    // response.cookies.set('session_token', authData.session.access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 60 * 60 * 24 * 7 // أسبوع واحد
    // });

    return response;

  } catch (error) {
    console.error('Authentication process failed:', error);
    return NextResponse.redirect(new URL(
      '/login?error=authentication_error',
      request.url
    ));
  }
}

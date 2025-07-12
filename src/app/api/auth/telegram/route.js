// app/api/auth/telegram/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// تكوين Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://xsxbeihsavosrxjyzmga.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o'
);

// دالة محسنة للتحقق من بيانات Telegram
async function verifyTelegramData(data) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';
    
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN missing in environment variables');
    }

    const receivedHash = data.hash;
    if (!receivedHash) {
      throw new Error('No hash received from Telegram');
    }

    // إعداد سلسلة التحقق من البيانات
    const dataCheckString = Object.keys(data)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n');

    // إنشاء مفتاح سري من توكن البوت
    const secretKey = crypto.createHash('sha256')
      .update(botToken)
      .digest();

    // حساب الهاش المتوقع
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // التحقق من انتهاء الصلاحية (10 دقائق كحد أقصى)
    const authDate = parseInt(data.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    const isNotExpired = (now - authDate) < 600; // 10 دقائق

    if (!isNotExpired) {
      throw new Error('Telegram data expired (older than 10 minutes)');
    }

    if (calculatedHash !== receivedHash) {
      throw new Error('Hash verification failed');
    }

    return true;
  } catch (error) {
    console.error('Verification error:', error.message);
    return false;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    console.log('Received Telegram auth data:', {
      id: params.id,
      first_name: params.first_name,
      username: params.username,
      auth_date: new Date(parseInt(params.auth_date) * 1000).toISOString()
    });

    // التحقق من صحة البيانات
    if (!await verifyTelegramData(params)) {
      console.error('Telegram data verification failed');
      return NextResponse.redirect(new URL(
        '/login?error=telegram_auth_failed&reason=invalid_hash',
        request.url
      ));
    }

    // البحث/إنشاء المستخدم في Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', params.id)
      .maybeSingle();

    if (userError) throw userError;

    let currentUser = user;
    
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .upsert({
          telegram_id: params.id,
          username: params.username || `user_${params.id}`,
          first_name: params.first_name,
          last_name: params.last_name,
          photo_url: params.photo_url,
          auth_date: new Date(parseInt(params.auth_date) * 1000).toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      currentUser = newUser;
    } else {
      // تحديث بيانات المستخدم إذا لزم الأمر
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          ...(params.photo_url && { photo_url: params.photo_url })
        })
        .eq('telegram_id', params.id);

      if (updateError) throw updateError;
    }

    // إنشاء جلسة Auth (طريقة أكثر أماناً)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${params.id}@telegram.user`,
      password: crypto.createHash('sha256').update(params.id + process.env.SUPABASE_JWT_SECRET).digest('hex')
    });

    if (authError) throw authError;

    // إعادة التوجيه مع تعيين الكوكيز
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    response.cookies.set('sb-access-token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 604800, // أسبوع واحد
      path: '/',
      sameSite: 'lax'
    });

    response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 604800,
      path: '/',
      sameSite: 'lax'
    });

    console.log(`User ${params.id} authenticated successfully`);
    return response;

  } catch (error) {
    console.error('Authentication process failed:', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.redirect(new URL(
      `/login?error=authentication_error&details=${encodeURIComponent(error.message)}`,
      request.url
    ));
  }
}

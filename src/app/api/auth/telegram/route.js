import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// --- Telegram API Credentials ---
// !!! SECURITY WARNING: Move these to environment variables (.env file) !!!
const TELEGRAM_API_ID = '20942401'; // Provided by user
const TELEGRAM_BOT_TOKEN = '7790436103:AAH4KwfhqwqYeeVzRwxrVhk3ZlTHkzHoP40'; // Provided by user

// إعداد عميل Supabase
const supabaseUrl = 'https://xsxbeihsavosrxjyzmga.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// التحقق من صحة بيانات تيليغرام
// Reference: https://core.telegram.org/widgets/login#checking-authorization
function verifyTelegramData(data) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram Bot Token is not configured!');
    return false; // Fail verification if token is missing
  }

  const receivedHash = data.hash;
  if (!receivedHash) {
    return false;
  }

  const dataCheckString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  try {
    const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Check if data is outdated (e.g., older than 1 day)
    const authDate = parseInt(data.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) { // 86400 seconds = 1 day
        console.warn("Telegram data is outdated.");
        return false;
    }

    return calculatedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  console.log('🔍 queryParams المستلمة من Telegram:', queryParams);

  // تحقق من صحة التوقيع
  /*if (!verifyTelegramData(queryParams)) {
    return NextResponse.redirect(new URL('/login?error=invalid_telegram', request.url));
  }*/

  const telegramId = queryParams.user_id;
  const fakeEmail = `${telegramId}@telegram.smartcoin.fake`;

  // تحقق من وجود المستخدم في auth
  let { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(fakeEmail);

  if (!authUser) {
    // إنشاء المستخدم في auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      email_confirm: true,
      password: crypto.randomBytes(32).toString('hex'),
      user_metadata: {
        telegram_id: telegramId,
        username: queryParams.username,
        first_name: queryParams.first_name,
        last_name: queryParams.last_name,
        photo_url: queryParams.photo_url,
      }
    });

    if (createError) {
      console.error('❌ إنشاء المستخدم في auth فشل:', createError);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    authUser = newUser;
  }

  // تحقق من وجود المستخدم في جدول users، وإذا لم يكن موجودًا أنشئه
  let { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (dbError && dbError.code === 'PGRST116') {
    const walletAddress = generateWalletAddress();
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          telegram_id: telegramId,
          username: queryParams.username,
          first_name: queryParams.first_name,
          last_name: queryParams.last_name,
          photo_url: queryParams.photo_url,
          wallet_address: walletAddress,
        }
      ]);

    if (insertError) {
      console.error('❌ فشل في إدخال المستخدم بجدول users:', insertError);
      return NextResponse.redirect(new URL('/login?error=user_insert_failed', request.url));
    }
  }

  // توليد MagicLink
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: fakeEmail,
  });

  if (linkError || !linkData?.action_link) {
    console.error('❌ فشل توليد magiclink:', linkError);
    return NextResponse.redirect(new URL('/login?error=link_failed', request.url));
  }

  const token = new URL(linkData.action_link).searchParams.get('token');
  const redirectUrl = new URL(`/auth/callback?token=${token}`, request.url);
  return NextResponse.redirect(redirectUrl.toString());
}

// إعادة استخدام نفس المنطق مع POST
export async function POST(request) {
  return await GET(request);
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

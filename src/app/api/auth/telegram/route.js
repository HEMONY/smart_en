// src/app/api/auth/telegram/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/* ─────────────────────────────
   الإعدادات (من .env)
───────────────────────────── */
const TELEGRAM_BOT_TOKEN = '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';
  //process.env.TELEGRAM_BOT_TOKEN || 'PASTE_YOUR_BOT_TOKEN_HERE';

const SUPABASE_URL = 'https://xsxbeihsavosrxjyzmga.supabase.co';
  //process.env.SUPABASE_URL || 'https://xxxxxxxx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o';
  //process.env.SUPABASE_SERVICE_KEY || 'PASTE_SERVICE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/* ─────────────────────────────
   1) دوال التحقق
───────────────────────────── */

/** تحقق من بيانات Login Widget التقليدية */
function verifyLoginWidget(data) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('[LoginWidget] ❌ Bot token missing');
    return false;
  }

  const receivedHash = data.hash;
  if (!receivedHash) {
    console.error('[LoginWidget] ❌ hash param missing', data);
    return false;
  }

  // إنشاء data_check_string
  const dataCheckString = Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');

  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const calcHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  /* صلاحية البيانات (يوم واحد) */
  const authDate = Number.parseInt(data.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    console.error('[LoginWidget] ❌ data is outdated', { authDate, now });
    return false;
  }

  if (calcHash !== receivedHash) {
    console.error('[LoginWidget] ❌ hash mismatch', { calcHash, receivedHash });
    console.error('[LoginWidget] data_check_string →', dataCheckString);
    return false;
  }

  console.log('[LoginWidget] ✅ verification passed');
  return true;
}

/** تحقق من initData القادمة من Mini‑App (WebApp) */
function verifyMiniApp(initData) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('[MiniApp] ❌ Bot token missing');
    return false;
  }
  if (!initData) {
    console.error('[MiniApp] ❌ initData missing in query');
    return false;
  }

  const urlParams = new URLSearchParams(initData);
  const receivedHash = urlParams.get('hash');
  if (!receivedHash) {
    console.error('[MiniApp] ❌ hash param missing in initData');
    return false;
  }

  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  /* data_check_string = جميع المعاملات بدون hash مرتبة أبجديـاً */
  const dataCheckString = Array.from(urlParams.entries())
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const calcHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calcHash !== receivedHash) {
    console.error('[MiniApp] ❌ hash mismatch', { calcHash, receivedHash });
    console.error('[MiniApp] data_check_string →', dataCheckString);
    return false;
  }

  console.log('[MiniApp] ✅ verification passed');
  return true;
}

/* ─────────────────────────────
   2) معالجات Next.js
───────────────────────────── */

export async function GET(req) {
  return handleAuth(req);
}

export async function POST(req) {
  return handleAuth(req);
}

async function handleAuth(request) {
  try {
    const url = new URL(request.url);

    /* -------------  كيف جاءت البيانات؟  ------------- */
    const isGet = request.method === 'GET';
    const query = Object.fromEntries(url.searchParams.entries());
    let payload = {}; // بيانات المستخدم المستخرَجة بعد التحقق

    /* أ) Mini‑App: عبر initData في Query */
    if (query.initData) {
      console.log('🔍 Mode: MiniApp');

      if (!verifyMiniApp(query.initData)) {
        return redirectWithError('/login?error=miniapp_auth_failed', request);
      }

      // استخراج user JSON من initData
      const decoded = decodeURIComponent(query.initData);
      const match = decoded.match(/user=({.*?})/);
      if (!match) {
        console.error('[MiniApp] ❌ user JSON not found in initData');
        return redirectWithError('/login?error=user_not_found', request);
      }

      payload = JSON.parse(match[1]);
    }

    /* ب) Login‑Widget: عبر معاملات Query (hash موجود) */
    else if (isGet && query.hash) {
      console.log('🔍 Mode: LoginWidget (GET)');

      if (!verifyLoginWidget(query)) {
        return redirectWithError('/login?error=widget_auth_failed', request);
      }

      payload = query;
    }

    /* ج) Mini‑App أو Login‑Widget (POST body) */
    else {
      console.log('🔍 Mode: POST body');

      const body = await request.json();
      if (body.hash) {
        // جسم قادم من Login Widget
        if (!verifyLoginWidget(body)) {
          return redirectWithError('/login?error=widget_auth_failed', request);
        }
        payload = body;
      } else {
        // نفترض أنه من Mini‑App وأُرسلت بيانات user فقط (بلا توقيع)
        payload = body;
        console.warn(
          '[POST] ⚠️ received user object without hash – skipping verification (assumed MiniApp)'
        );
      }
    }

    /* -------------  تخزين/تحديث المستخدم  ------------- */
    const userId = payload.id;
    if (!userId) {
      console.error('❌ No telegram_id detected in payload:', payload);
      return redirectWithError('/login?error=missing_id', request);
    }

    /* ابحث أو أضف المستخدم في Supabase */
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // ليس موجودًا → أنشئه
      const walletAddress = generateWalletAddress();
      const insertRes = await supabase
        .from('users')
        .insert([
          {
            telegram_id: userId,
            username: payload.username || `user${userId}`,
            wallet_address: walletAddress,
            first_name: payload.first_name,
            last_name: payload.last_name,
            photo_url: payload.photo_url,
          },
        ])
        .select()
        .single();

      if (insertRes.error) {
        console.error('Supabase insert error:', insertRes.error);
        return redirectWithError('/login?error=db_insert', request);
      }
      user = insertRes.data;
    } else if (error) {
      console.error('Supabase select error:', error);
      return redirectWithError('/login?error=db_select', request);
    } else {
      /* تحديث بيانات قديمة */
      const update = {};
      if (payload.username && payload.username !== user.username)
        update.username = payload.username;
      if (payload.photo_url && payload.photo_url !== user.photo_url)
        update.photo_url = payload.photo_url;

      if (Object.keys(update).length) {
        const up = await supabase
          .from('users')
          .update(update)
          .eq('id', user.id);
        if (up.error) console.error('Supabase update error:', up.error);
      }
    }

    console.log('✅ User ready → id:', user.id);

    /* -------------  إعادة التوجيه بعد النجاح  ------------- */
    return NextResponse.redirect(new URL('/dashboard', request.url), 302);
  } catch (e) {
    console.error('❌ Server exception:', e);
    return redirectWithError('/login?error=server', request);
  }
}

/* ─────────────────────────────
   أدوات مساعدة
───────────────────────────── */
function redirectWithError(path, request) {
  return NextResponse.redirect(new URL(path, request.url), 302);
}

function generateWalletAddress() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = 'EQC';
  for (let i = 0; i < 45; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

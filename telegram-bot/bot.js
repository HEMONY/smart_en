require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN || '7790436103:AAH4KwfhqwqYeeVzRwxrVhk3ZlTHkzHoP40';
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN غير مضبوط في ملف .env');
  process.exit(1);
}

const bot = new TelegramBot(token, {
  polling: true,
  request: {
    timeout: 15000
  }
});

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://smart-en.vercel.app';
const SESSION_TIMEOUT = 5 * 60 * 1000;

const welcomeMessage = `
🪙 *مرحباً بك في Smart Coin*  

✨ *مميزات جديدة:*  
- 💰 20 عملة يومياً  
- ⚡ سرعة تعدين ×2  
- 🎁 مكافآت إحالة تصل لـ50 عملة  
- 📊 لوحة تحكم متقدمة  

🔒 *طريقة التسجيل الآمنة:*  
1. اضغط "دخول المنصة"  
2. سجل الدخول عبر Telegram  
3. ابدأ التعدين فوراً  

⚠ *تحذير:* لا تشارك رمز التحقق مع أي أحد  
`;

const authSessions = new Map();

function generateSession(userId) {
  const session = {
    code: crypto.randomInt(100000, 999999),
    expiresAt: Date.now() + SESSION_TIMEOUT,
    verified: false
  };

  authSessions.set(userId, session);

  setTimeout(() => {
    if (authSessions.get(userId)?.expiresAt <= Date.now()) {
      authSessions.delete(userId);
    }
  }, SESSION_TIMEOUT);

  return session;
}

// ✅ جزء تعديل رابط التسجيل الكامل مع hash
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const { code } = generateSession(userId);

  const auth_date = Math.floor(Date.now() / 1000);
  const first_name = msg.from.first_name || '';
  const last_name = msg.from.last_name || '';
  const username = msg.from.username || '';
  const photo_url = msg.from.photo_url || '';

  // بيانات Telegram الرسمية
  const data = {
    id: userId,
    auth_date,
    first_name,
    last_name,
    username,
    photo_url
  };

  // إنشاء data_check_string
  const sortedKeys = Object.keys(data).sort();
  const dataCheckString = sortedKeys.map(key => `${key}=${data[key]}`).join('\n');

  // حساب hash
  const secretKey = crypto.createHash('sha256').update(token).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const authUrl = `${WEB_APP_URL}/api/auth/telegram` +
    `?user_id=${data.id}` +
    `&auth_code=${auth_date}` +
    `&first_name=${encodeURIComponent(first_name)}` +
    `&last_name=${encodeURIComponent(last_name)}` +
    `&username=${encodeURIComponent(username)}` +
    `&photo_url=${encodeURIComponent(photo_url)}` +
    `&hash=${hash}`;

  try {
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 دخول المنصة', web_app: { url: authUrl } }],
          [
            { text: '📊 لوحتي', callback_data: 'my_dashboard' },
            { text: '🎁 كود الإحالة', callback_data: 'referral_code' }
          ]
        ]
      }
    });

    console.log(`🔵 بدأت جلسة جديدة للمستخدم ${userId}`);

  } catch (error) {
    console.error('فشل إرسال رسالة الترحيب:', error);
    await bot.sendMessage(chatId, '⚠ حدث خطأ أثناء التحميل، يرجى المحاولة لاحقاً');
  }
});

bot.on('message', async (msg) => {
  if (!msg.web_app_data) return;

  const userId = msg.from.id;
  const session = authSessions.get(userId);

  try {
    const data = JSON.parse(msg.web_app_data.data);

    if (!session || session.code !== data.auth_code) {
      throw new Error('رمز التحقق غير صالح');
    }

    const response = await axios.post(`${WEB_APP_URL}/api/auth/verify`, {
      user_id: userId,
      auth_data: data
    });

    if (response.data.success) {
      session.verified = true;
      await bot.sendMessage(userId, '✅ *تم التسجيل بنجاح!*', {
        parse_mode: 'Markdown'
      });
    } else {
      throw new Error(response.data.error || 'فشل التحقق');
    }

  } catch (error) {
    console.error('خطأ المصادقة:', error.message);
    await bot.sendMessage(userId, `❌ ${error.message || 'حدث خطأ غير متوقع'}`);
  }
});

const buttonHandlers = {
  my_dashboard: async (chatId) => {
    await bot.sendMessage(chatId, '📊 جاري تحميل البيانات...');
  },
  referral_code: async (chatId) => {
    await bot.sendMessage(chatId, `🔗 كود الإحالة الخاص بك:\n\`ref_${chatId}\``, {
      parse_mode: 'Markdown'
    });
  }
};

bot.on('callback_query', async (query) => {
  const handler = buttonHandlers[query.data];
  if (handler) {
    await handler(query.message.chat.id);
  }
  await bot.answerCallbackQuery(query.id);
});

bot.on('polling_error', (error) => {
  console.error('❌ خطأ في الاتصال:', error.message);
});

setInterval(() => {
  console.log('🟢 حالة البوت: نشط | الجلسات النشطة:', authSessions.size);
}, 3600000);

console.log('🚀 بوت Smart Coin يعمل بنجاح!');

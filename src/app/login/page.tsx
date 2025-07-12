'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
}

export default function LoginPage() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.initDataUnsafe?.user) {
      setError('لم يتم العثور على بيانات المستخدم من Telegram.');
      setLoading(false);
      return;
    }

    const userData = tg.initDataUnsafe.user;

    setUser(userData);

    const payload = {
      id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      photo_url: userData.photo_url,
      auth_date: tg.initDataUnsafe.auth_date,
      hash: tg.initDataUnsafe.hash,
    };

    // إرسال البيانات للسيرفر للتحقق
    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.error || 'حدث خطأ أثناء تسجيل الدخول');
        }
        return res.json();
      })
      .then(data => {
        console.log('تم التحقق من المستخدم:', data.user);
        // يمكنك الآن توجيه المستخدم إلى الصفحة الرئيسية مثلاً
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center">
        <Image
          src="/assets/smart-coin-logo.png"
          alt="Smart Coin"
          width={100}
          height={100}
          className="mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold mb-2 gold-text">Smart Coin</h1>
        <p className="text-gray-400 mb-6">منصة التعدين الذكية</p>

        {loading ? (
          <p>جارٍ تسجيل الدخول عبر Telegram...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : user ? (
          <div className="space-y-3">
            <p>مرحباً، {user.first_name}</p>
            {user.username && <p>@{user.username}</p>}
            {user.photo_url && (
              <img
                src={user.photo_url}
                alt="الصورة الشخصية"
                className="rounded-full w-24 h-24 mx-auto"
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

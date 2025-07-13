'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
      setError('فشل في الحصول على بيانات تسجيل الدخول من Telegram');
      return;
    }

    const data = tg.initDataUnsafe;
    console.log('✅ Telegram WebApp data:', data);

    // تحقق من وجود القيم المطلوبة
    if (!data.user || !data.auth_date || !data.hash) {
      setError('البيانات غير مكتملة من Telegram');
      return;
    }

    const payload = {
      user_id: data.user.id,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      username: data.user.username,
      photo_url: data.user.photo_url,
      auth_date: data.auth_date,
      hash: data.hash
    };

    verifyAuthData(payload);
  }, []);

  const verifyAuthData = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('فشل التحقق من البيانات');
      }
    } catch (err) {
      setError('حدث خطأ أثناء المصادقة: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center">
            {error}
            <button 
              onClick={() => setError('')}
              className="mr-2 text-sm underline"
            >
              إغلاق
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <Image 
            src="/assets/smart-coin-logo.png" 
            alt="Smart Coin" 
            width={120}
            height={120}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl font-bold text-yellow-400">Smart Coin</h1>
          <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
          <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">
            نسعى لنصبح منصة لا مركزية رائدة لتداول العملات المشفرة
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">جاري التحقق من الدخول...</h2>

          <div className="text-center text-gray-400">
            {isLoading ? (
              <span>⏳ يرجى الانتظار...</span>
            ) : (
              <span>👆 يرجى فتح هذه الصفحة من داخل تطبيق Telegram</span>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>باستمرارك، أنت توافق على <Link href="/terms" className="text-yellow-400 hover:underline">الشروط</Link> و <Link href="/privacy" className="text-yellow-400 hover:underline">الخصوصية</Link></p>
        </div>
      </div>
    </div>
  );
}

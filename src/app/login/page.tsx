'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  const verifyAuthData = async (data: any) => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('فشل التحقق من البيانات');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.async = true;
  script.setAttribute('data-telegram-login', 'smartcoin_bot'); // ← غيّرها لاسم بوتك
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  script.setAttribute('data-request-access', 'write');
  document.getElementById('telegram-button')?.appendChild(script);

  (window as any).onTelegramAuth = (userData: any) => {
    console.log('✅ بيانات Telegram:', userData);
    verifyAuthData(userData);
  };

  return () => {
    const container = document.getElementById('telegram-button');
    if (container) container.innerHTML = '';
  };
}, []);


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
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة التسجيل</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                سجل دخولك بضغطة واحدة باستخدام حساب تيليجرام
              </p>
              <div id="telegram-button" className="flex justify-center" />
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                اتصل بمحفظتك الخارجية لتسجيل الدخول
              </p>
              <button
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
                onClick={() => alert('🚧 سيتم تفعيل هذه الميزة قريباً')}
              >
                <SiTon size={20} />
                <span>الاتصال بالمحفظة</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>
            باستمرارك، أنت توافق على{' '}
            <Link href="/terms" className="text-yellow-400 hover:underline">
              الشروط
            </Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-yellow-400 hover:underline">
              الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

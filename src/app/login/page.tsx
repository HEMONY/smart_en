'use client';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    const botLoginName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'Tesmiapbot'; // بدون @

    const container = document.getElementById('telegram-button');
    if (container) container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botLoginName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram/callback`);
    script.setAttribute('data-radius', '10');

    if (container) container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center">
            {error}
            <button onClick={() => setError('')} className="mr-2 text-sm underline">
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
              {/* زر تسجيل الدخول من Telegram Widget */}
              <div id="telegram-button" className="flex justify-center"></div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                اتصل بمحفظتك الخارجية لتسجيل الدخول
              </p>
              <button
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
                onClick={() => alert('سيتم تفعيل هذه الميزة قريباً')}
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

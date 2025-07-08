'use client';

import { useEffect } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';

export default function LoginPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?7';
    script.setAttribute('data-telegram-login', 'SMARtcoinNbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-auth-url', 'https://smart-en.vercel.app/api/auth/telegram');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const container = document.getElementById('telegram-login');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/assets/smart-coin-logo.png" alt="Smart Coin" width={120} height={120} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold gold-text">Smart Coin</h1>
          <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <div id="telegram-login" className="flex justify-center"></div>
            </div>
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر TON</h3>
              <button className="secondary-button w-full flex items-center justify-center">
                <SiTon size={20} />
                <span className="ml-2">تسجيل الدخول عبر TON</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          بالتسجيل توافق على <a href="/terms" className="text-primary-gold">الشروط</a> و <a href="/privacy" className="text-primary-gold">الخصوصية</a>
        </p>
      </div>
    </div>
  );
}


'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?7';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const container = document.getElementById('telegram-login');
      if (!container) return;

      container.innerHTML = ''; // أزل أي محتوى سابق
      const widget = document.createElement('div');
      widget.setAttribute('data-telegram-login', 'Tesmiapbot'); // اسم البوت بدون @
      widget.setAttribute('data-size', 'large');
      widget.setAttribute('data-userpic', 'false');
      widget.setAttribute('data-request-access', 'write');
      widget.setAttribute('data-auth-url', 'https://smart-en.vercel.app/api/auth/telegram');
      container.appendChild(widget);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* الشعار */}
      <div className="w-full max-w-md text-center mb-8">
        <Image src="/assets/smart-coin-logo.png" alt="Smart Coin" width={120} height={120} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold gold-text">Smart Coin</h1>
        <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
        <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">منصة لا مركزية لتداول العملات المشفرة.</p>
      </div>

      {/* بطاقة التسجيل */}
      <div className="card mb-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">تسجيل الدخول عبر تيليجرام</h2>
        <div className="flex justify-center">
          {/* سيُضاف هنا الزر بواسطة السكربت */}
          <div id="telegram-login"></div>
        </div>
      </div>

      {/* رابط محفظة TON */}
      <div className="card w-full max-w-md">
        <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
        <button className="secondary-button w-full flex items-center justify-center">
          <SiTon size={20} />
          <span className="mr-2">تسجيل الدخول عبر TON</span>
        </button>
      </div>

      {/* شروط الاستخدام */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          بالتسجيل، أنت توافق على&nbsp;
          <Link href="/terms" className="text-primary-gold">شروط الاستخدام</Link>
          &nbsp;و&nbsp;
          <Link href="/privacy" className="text-primary-gold">سياسة الخصوصية</Link>.
        </p>
      </div>
    </div>
  );
}

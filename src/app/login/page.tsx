"use client";

import { useEffect, useRef } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const tgRef = useRef(null);

  useEffect(() => {
    // زر تسجيل الدخول من Telegram
    if (tgRef.current) {
      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?7";
      script.setAttribute("data-telegram-login", "Tesmiapbot"); // غيّر هذا لاسم بوتك
      script.setAttribute("data-size", "large");
      script.setAttribute("data-userpic", "false");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-lang", "ar");
      script.setAttribute("data-auth-url", "/api/auth/telegram"); // المسار الذي يعالج البيانات
      script.async = true;
      tgRef.current.innerHTML = ''; // احذف أي شيء داخلي
      tgRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image 
            src="/assets/smart-coin-logo.png" 
            alt="Smart Coin" 
            width={120} 
            height={120} 
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold gold-text">Smart Coin</h1>
          <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام حساب تيليجرام الخاص بك...
              </p>

              {/* ✅ مكان الزر */}
              <div ref={tgRef} className="flex justify-center" />

            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                تسجيل الدخول باستخدام محفظة TON...
              </p>
              <button className="secondary-button w-full">
                <SiTon size={20} />
                <span>تسجيل الدخول عبر محفظة TON</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            بالتسجيل، أنت توافق على <Link href="/terms" className="text-primary-gold">شروط الاستخدام</Link> و <Link href="/privacy" className="text-primary-gold">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

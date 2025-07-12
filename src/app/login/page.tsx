"use client";

import { useState } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleTelegramAuth = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/telegram?' + new URLSearchParams(userData), {
        method: 'GET'
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('فشل الاتصال:', err);
      setResponse({ error: 'فشل الاتصال بالخادم.' });
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا...
          </p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام حساب تيليجرام الخاص بك.
              </p>

              {/* ✅ Telegram Login Widget */}
              <div className="flex justify-center">
                <div id="telegram-button"></div>
              </div>

              {/* 🟨 عرض النتيجة */}
              {loading && <p className="text-center mt-2 text-yellow-400">🔄 جاري المعالجة...</p>}
              {response && (
                <div className="mt-4 text-sm bg-gray-800 text-gray-200 p-3 rounded">
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              )}
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

      {/* ✅ Telegram Script */}
      <script
        async
        src="https://telegram.org/js/telegram-widget.js?7"
        data-telegram-login="Tesmiapbot"  // <-- غيّرها لاسم بوتك
        data-size="large"
        data-userpic="false"
        data-request-access="write"
        data-onauth="handleTelegramAuth(user)"
        data-lang="ar"
      ></script>

      <script dangerouslySetInnerHTML={{
        __html: `
          window.handleTelegramAuth = function(user) {
            const event = new CustomEvent("telegram-user", { detail: user });
            window.dispatchEvent(event);
          }
        `
      }} />

      {/* ✅ استخدم useEffect لربط الـ handler */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener("telegram-user", function(e) {
            const user = e.detail;
            if (typeof window.__NEXT_HOOK_TG_HANDLER__ === 'function') {
              window.__NEXT_HOOK_TG_HANDLER__(user);
            }
          });
        `
      }} />

      <script dangerouslySetInnerHTML={{
        __html: `
          window.__NEXT_HOOK_TG_HANDLER__ = ${handleTelegramAuth.toString()};
        `
      }} />
    </div>
  );
}

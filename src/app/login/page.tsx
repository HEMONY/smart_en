'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
declare global {
  interface Window {
    TelegramLoginWidget?: {
      init: () => void;
    };
  }
}

export default function LoginPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.TelegramLoginWidget) {
      window.TelegramLoginWidget.init();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* تحميل سكربت تيليجرام */}
      <Script
        src="https://telegram.org/js/telegram-widget.js?7"
        strategy="afterInteractive"
      />

      <div className="w-full max-w-md">
        <div
          dangerouslySetInnerHTML={{
            __html: `<script async src="https://telegram.org/js/telegram-widget.js?7"
              data-telegram-login="Tesmiapbot"
              data-size="large"
              data-userpic="true"
              data-request-access="write"
              data-auth-url="https://smart-en.vercel.app/api/auth/telegram">
            </script>`
          }}
        />


        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام حساب تيليجرام الخاص بك. سيتم إرسال رمز تحقق إلى بوت تيليجرام الخاص بنا.
              </p>

              {/* زر تسجيل الدخول عبر تيليجرام */}
              <div
                dangerouslySetInnerHTML={{
                  __html: `<script async src="https://telegram.org/js/telegram-widget.js?7"
                    data-telegram-login="Tesmiapbot"
                    data-size="large"
                    data-userpic="true"
                    data-request-access="write"
                    data-auth-url="https://smart-en.vercel.app/api/auth/telegram">
                  </script>`
                }}
              />


            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام محفظة TON الخاصة بك. سيتم التحقق من هويتك عبر توقيع رسالة بمحفظتك.
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
            بالتسجيل، أنت توافق على{' '}
            <Link href="/terms" className="text-primary-gold">شروط الاستخدام</Link> و{' '}
            <Link href="/privacy" className="text-primary-gold">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';

export default function LoginPage() {
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
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا. 
            نسعى لنصبح منصة لا مركزية رائدة لتداول العملات المشفرة، وستكون عملتنا الرقمية جزءًا أساسيًا من نظام الدفع داخل المنصة.
          </p>
        </div>

        <div className="card mb-6 text-center">
          <h2 className="text-xl font-bold mb-4">اختر طريقة تسجيل الدخول المفضلة لديك</h2>

          {/* Telegram Login Widget */}
          <div id="telegram-login" className="mb-6 flex justify-center">
            <Script
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login="SmartCoinBot" // <-- ضع هنا اسم البوت الخاص بك بدون @
              data-size="large"
              data-userpic="true"
              data-request-access="write"
              data-auth-url="https://smart-en.vercel.app/api/auth/telegram"
              strategy="afterInteractive"
            />
          </div>

          {/* بديل لمحفظة TON */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
            <p className="text-sm text-gray-400 mb-3">
              قم بتسجيل الدخول باستخدام محفظة TON الخاصة بك. سيتم التحقق من هويتك عبر توقيع رسالة بمحفظتك.
            </p>
            <button className="secondary-button w-full flex items-center justify-center gap-2">
              <SiTon size={20} />
              <span>تسجيل الدخول عبر محفظة TON</span>
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          بالتسجيل، أنت توافق على{' '}
          <Link href="/terms" className="text-primary-gold">شروط الاستخدام</Link> و{' '}
          <Link href="/privacy" className="text-primary-gold">سياسة الخصوصية</Link>
        </div>
      </div>
    </div>
  );
}

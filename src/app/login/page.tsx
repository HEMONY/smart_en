'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';

declare global {
  interface Window {
    TelegramLoginWidget: any;
    onTelegramAuth: (user: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();

  // هذه الدالة تُنفذ عند نجاح تسجيل الدخول من الزر الرسمي
  useEffect(() => {
    window.onTelegramAuth = async function (user: any) {
      try {
        const query = new URLSearchParams(user).toString();
        const res = await fetch(`/api/auth/telegram?${query}`, { method: 'GET' });

        if (res.redirected) {
          router.push(res.url);
        } else {
          alert('❌ فشل التحقق من المستخدم!');
        }
      } catch (err) {
        console.error('❌ خطأ في تسجيل الدخول:', err);
        alert('حدث خطأ أثناء إرسال البيانات للخادم.');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'Tesmiapbot'); // ← اسم بوتك بدون @
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const container = document.getElementById('telegram-button');
    if (container) {
      container.innerHTML = ''; // إزالة أي محتوى سابق
      container.appendChild(script);
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
          <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا. نسعى لنصبح منصة لا مركزية رائدة لتداول العملات المشفرة.
          </p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                اضغط على الزر لتسجيل الدخول باستخدام حسابك في تيليجرام
              </p>
              <div id="telegram-button" className="flex justify-center" />
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام محفظة TON الخاصة بك.
              </p>
              <button className="secondary-button w-full">
                <SiTon size={20} />
                <span>تسجيل الدخول بمحفظة TON</span>
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) setIsTelegram(true);
  }, []);

  const handleTelegramLogin = async () => {
    const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;

    if (!tgUser) {
      alert('⚠️ لا يمكن الحصول على بيانات المستخدم من Telegram. تأكد أنك داخل تطبيق تيليجرام.');
      return;
    }

    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      });

      const data = await res.json();

      if (data.ok) {
        alert('✅ تم تسجيل الدخول بنجاح!');
        router.push('/dashboard');
      } else {
        alert('❌ فشل التحقق من المستخدم!');
        console.log(data);
      }
    } catch (err) {
      console.error('❌ فشل في إرسال الطلب:', err);
      alert('حدث خطأ أثناء إرسال البيانات إلى الخادم.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#121c28]">
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
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا. نسعى لنصبح منصة لا مركزية رائدة لتداول العملات المشفرة، وستكون عملتنا الرقمية جزءًا أساسيًا من نظام الدفع داخل المنصة.
          </p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                يجب استخدام هذا الخيار من داخل تطبيق تيليجرام.
              </p>
              <button
                onClick={handleTelegramLogin}
                className={`primary-button w-full ${!isTelegram ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isTelegram}
              >
                <FaTelegramPlane size={20} />
                <span>تسجيل الدخول عبر تيليجرام</span>
              </button>
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

'use client';

import { useEffect } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // استمع للرسالة القادمة من Telegram Widget بعد المصادقة
    const handleTelegramLogin = async (event) => {
      if (event.origin !== 'https://telegram.org') return;

      try {
        const userData = event.data;
        const query = new URLSearchParams(userData).toString();
        const res = await fetch(`/api/auth/telegram?${query}`);
        const result = await res.json();

        if (result.user) {
          localStorage.setItem('smartcoin_user', JSON.stringify(result.user));
          router.push('/dashboard');
        } else {
          alert('فشل تسجيل الدخول. الرجاء المحاولة لاحقاً');
        }
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء تسجيل الدخول.');
      }
    };

    window.addEventListener('message', handleTelegramLogin);

    return () => window.removeEventListener('message', handleTelegramLogin);
  }, [router]);

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
          <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا...</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <div className="flex justify-center">
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<script async src="https://telegram.org/js/telegram-widget.js?7"
                      data-telegram-login="Tesmiapbot"
                      data-size="large"
                      data-userpic="false"
                      data-request-access="write"
                      data-auth-url="javascript:void(0);"
                      data-lang="ar"></script>`,
                  }}
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
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

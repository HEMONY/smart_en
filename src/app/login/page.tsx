'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';

declare global { interface Window { Telegram: any; } }

export default function LoginPage() {
  const router = useRouter();
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) {
      setIsInsideTelegram(true);
      setLoading(true);
      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })
        .then(async (res) => {
          if (!res.ok) {
            alert('❌ فشل التحقق من المستخدم!');
            setLoading(false);
            return;
          }
          const { ok } = await res.json();
          ok ? router.push('/dashboard') : alert('❌ فشل في المصادقة');
        })
        .catch((e) => { console.error(e); setLoading(false); });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* ... الترويسة والعناصر البصرية كما في السابق ... */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
          <p className="text-sm text-gray-400 mb-3">
            {isInsideTelegram
              ? '🔒 يُجري تسجيل الدخول تلقائيًا من داخل تيليجرام.'
              : 'اضغط على الزر أدناه لتسجيل الدخول عبر تيليجرام.'}
          </p>
          {isInsideTelegram ? (
            <button className="primary-button w-full opacity-50 cursor-not-allowed" disabled>
              <FaTelegramPlane size={20} /><span>جاري تسجيل الدخول...</span>
            </button>
          ) : (
            <Link href="/api/auth/telegram" className="primary-button w-full">
              <FaTelegramPlane size={20} /><span>تسجيل الدخول عبر تيليجرام</span>
            </Link>
          )}
        </div>
        {/* زر محفظة TON هنا */}
      </div>
    </div>
  );
}

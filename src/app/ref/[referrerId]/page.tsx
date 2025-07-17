'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RefPageProps {
  params: {
    referrerId: string;
  };
}

export default function ReferrerPage({ params }: RefPageProps) {
  const router = useRouter();
  const { referrerId } = params;

  useEffect(() => {
    // حفظ referrerId في localStorage لتخزينه مؤقتاً إلى أن يسجل المستخدم
    if (referrerId) {
      localStorage.setItem('referrerId', referrerId);

      // اختيارياً: إرسال طلب لزيادة عدد الإحالات الآن (إن أردت)
      fetch('/api/referral/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referrerId }),
      }).catch((err) => {
        console.error('Failed to increase referral count:', err);
      });
    }

    const timeout = setTimeout(() => {
      router.replace('/referrals'); // تغيير المسار إذا أردت
    }, 3000);

    return () => clearTimeout(timeout);
  }, [referrerId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">شكراً لزيارة رابط الإحالة!</h1>
      <p className="mb-4">تم تسجيل الإحالة الخاصة بك: <strong>{referrerId}</strong></p>
      <p>سيتم توجيهك تلقائياً خلال ثوانٍ...</p>
    </div>
  );
}

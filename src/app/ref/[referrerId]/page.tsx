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
    // هنا ممكن تضيف منطق تسجيل ال Referral في DB أو إرسال API
    console.log('Referral ID:', referrerId);

    // بعد تسجيل الإحالة توجه المستخدم مثلاً لصفحة تسجيل أو الصفحة الرئيسية
    const timeout = setTimeout(() => {
      router.replace('/referrals'); // أو أي صفحة تريد إعادة التوجيه لها
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

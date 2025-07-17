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
    // سجل الإحالة في قاعدة البيانات عبر API
    fetch('/api/referral', {
      method: 'POST',
      body: JSON.stringify({ referrerId }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(() => {
      // توجيه المستخدم إلى بوت التليجرام مع referrerId
      router.replace(`https://t.me/SMARtcoinNbot?start=${referrerId}`);
    });
  }, [referrerId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">جاري توجيهك إلى التليجرام...</h1>
      <p>معرف الإحالة: <strong>{referrerId}</strong></p>
    </div>
  );
}

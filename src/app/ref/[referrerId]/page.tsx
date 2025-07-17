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
    fetch('/referrals/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerId }),
    }).finally(() => {
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

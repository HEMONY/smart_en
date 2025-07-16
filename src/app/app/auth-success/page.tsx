'use client';
export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (userId) {
      localStorage.setItem('smartCoinUser', JSON.stringify({ id: userId }));
      window.location.href = '/dashboard'; // إعادة التوجيه
    }
  }, [userId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg text-gray-400">
      يتم تحميل حسابك...
    </div>
  );
}

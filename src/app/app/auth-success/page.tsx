'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function AuthSuccessInner() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      localStorage.setItem('smartCoinUser', JSON.stringify({ id: userId }));
      router.replace('/dashboard');
    }
  }, [userId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
      ✅ جاري تحويلك إلى لوحة التحكم...
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">🔄 تحميل...</div>}>
      <AuthSuccessInner />
    </Suspense>
  );
}

'use client';
export const dynamic = "force-dynamic";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('user_id');
    if (userId) {
      localStorage.setItem('smartCoinUser', JSON.stringify({ id: userId }));
      router.push('/profile'); // أو أي صفحة رئيسية
    } else {
      alert('فشل تسجيل الدخول.');
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      جاري تسجيل الدخول...
    </div>
  );
}

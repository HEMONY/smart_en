'use client'; // ⬅️ ضروري لجعل الصفحة client-side فقط
export const dynamic = 'force-dynamic'; // ⬅️ يمنع Next.js من محاولة pre-render

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (userId) {
      localStorage.setItem('smartCoinUser', JSON.stringify({ id: userId }));
      window.location.href = '/dashboard';
    }
  }, [userId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
      ✅ جاري تحويلك إلى لوحة التحكم...
    </div>
  );
}

'use client'; // ⬅️ مطلوب لجعل الصفحة تعمل فقط على العميل

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      localStorage.setItem('smartCoinUser', JSON.stringify({ id: userId }));
      router.replace('/dashboard');
    }
  }, [userId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
      ✅ جاري تحويلك إلى لوحة التحكم...
    </div>
  );
}

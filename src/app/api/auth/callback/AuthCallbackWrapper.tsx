'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackWrapper() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!token) return;

    const login = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });

      if (error) {
        console.error('❌ فشل تسجيل الدخول:', error);
        router.push('/login?error=session_failed');
      } else {
        router.push('/dashboard');
      }
    };

    login();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      جاري تسجيل الدخول...
    </div>
  );
}

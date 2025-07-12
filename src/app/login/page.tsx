'use client';
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    const container = document.getElementById('telegram-login-container');
    if (!container) return;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'Tesmiapbot'); // بدون @
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', 'https://smart-en.vercel.app/api/auth/telegram/callback');
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">Smart Coin</h1>
        <p className="text-gray-400 mb-6">سجّل الدخول باستخدام تيليجرام</p>
        <div id="telegram-login-container" />
      </div>
    </div>
  );
}

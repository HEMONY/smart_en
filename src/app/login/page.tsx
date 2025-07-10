"use client";
import { useEffect } from 'react';
import Script from 'next/script';

export default function TelegramLoginButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?7';
    script.async = true;
    document.getElementById('telegram-button-container')?.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center">
      <div
        id="telegram-button-container"
        data-telegram-login="Tesmiapbot"
        data-size="large"
        data-userpic="false"
        data-request-access="write"
        data-auth-url="https://smart-en.vercel.app/api/auth/telegram"
      ></div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
        };
        ready: () => void;
      };
    };
  }
}

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();

      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser);
      }
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-black">
      <h1 className="text-2xl font-bold mb-4">Smart Coin</h1>
      {user ? (
        <div className="text-center">
          <img src={user.photo_url} className="w-20 h-20 rounded-full mx-auto mb-2" />
          <p>مرحباً، {user.first_name}</p>
          <p>@{user.username}</p>
        </div>
      ) : (
        <p className="text-red-400 text-center">❌ لا توجد بيانات مستخدم. تأكد أنك فتحت من Telegram مباشرة.</p>
      )}
    </main>
  );
}

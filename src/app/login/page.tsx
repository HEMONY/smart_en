"use client";

import { useEffect, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { SiTon } from "react-icons/si";
import Image from "next/image";
import Link from "next/link";

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
          auth_date: string;
          hash: string;
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
      console.log("✅ Telegram WebApp موجود");
      window.Telegram.WebApp.ready();

      const initData = window.Telegram.WebApp.initDataUnsafe;

      if (initData?.user) {
        console.log("✅ تم التعرف على المستخدم:", initData.user);
        setUser(initData.user);

        fetch("/api/auth/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...initData.user,
            auth_date: initData.auth_date,
            hash: initData.hash,
          }),
        });
      } else {
        console.warn("❌ لا يوجد بيانات مستخدم من Telegram WebApp.");
      }
    } else {
      console.warn("❌ Telegram WebApp غير موجود.");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/smart-coin-logo.png"
            alt="Smart Coin"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold gold-text">Smart Coin</h1>
          <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              {user ? (
                <div className="flex flex-col items-center text-white">
                  <img src={user.photo_url} alt="User" className="w-20 h-20 rounded-full mb-2" />
                  <p className="font-bold">مرحباً، {user.first_name}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              ) : (
                <p className="text-center text-gray-400">جاري التحقق من حساب تيليجرام...</p>
              )}
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <button className="secondary-button w-full">
                <SiTon size={20} />
                <span>تسجيل الدخول عبر محفظة TON</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            بالتسجيل، أنت توافق على{" "}
            <Link href="/terms" className="text-primary-gold">
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link href="/privacy" className="text-primary-gold">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { SiTon } from "react-icons/si";
import Image from "next/image";
import Link from "next/link";
// ⬅️ ✅ تعريف Telegram على Window
declare global {
  interface Window {
    Telegram: {
      WebApp: {
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      console.log('✅ WebApp مكتشف:', window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
    } else {
      console.warn('❌ لا يوجد Telegram WebApp. تأكد من فتح الرابط من تيليجرام.');
    }
    console.log("🌐 التحقق من Telegram WebApp:", window.Telegram?.WebApp);
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      const tgInitData = window.Telegram.WebApp.initDataUnsafe;
      console.log("✅ تم الحصول على بيانات المستخدم من تيليجرام:", tgUser);

      setUser(tgUser);

      // ⬇️ إرسال البيانات إلى API للتحقق
      fetch("/api/auth/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
          photo_url: tgUser.photo_url,
          auth_date: tgInitData.auth_date,
          hash: tgInitData.hash,
        }),
      });
    }else {
    console.warn("❌ لا يوجد بيانات من Telegram. تأكد أنك فتحت الموقع من WebApp.");
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
          <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا. نسعى لنصبح منصة لا مركزية رائدة لتداول العملات المشفرة، وستكون عملتنا الرقمية جزءًا أساسيًا من نظام الدفع داخل المنصة.
          </p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام حساب تيليجرام الخاص بك. سيتم إرسال رمز تحقق إلى بوت تيليجرام الخاص بنا.
              </p>

              {user ? (
                <div className="flex flex-col items-center text-white">
                  <img src={user.photo_url} alt="User" className="w-20 h-20 rounded-full mb-2" />
                  <p className="font-bold">مرحباً، {user.first_name}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-center">جاري التحقق من حساب تيليجرام...</p>
              )}
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام محفظة TON الخاصة بك. سيتم التحقق من هويتك عبر توقيع رسالة بمحفظتك.
              </p>
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

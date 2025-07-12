"use client";

import { useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { SiTon } from "react-icons/si";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTelegramLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/telegram");
      const data = await res.json(); // إذا كانت الاستجابة JSON
      setResponseData(data);
    } catch (error) {
      setResponseData({ error: "فشل الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام حساب تيليجرام الخاص بك...
              </p>
              <button
                onClick={handleTelegramLogin}
                className="primary-button w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                <FaTelegramPlane size={20} />
                <span>{loading ? "جاري المعالجة..." : "تسجيل الدخول عبر تيليجرام"}</span>
              </button>

              {responseData && (
                <div className="mt-4 text-sm text-left bg-gray-800 p-3 rounded">
                  <pre className="whitespace-pre-wrap text-gray-300">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام محفظة TON الخاصة بك...
              </p>
              <button className="secondary-button w-full flex items-center justify-center gap-2">
                <SiTon size={20} />
                <span>تسجيل الدخول عبر محفظة TON</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            بالتسجيل، أنت توافق على <Link href="/terms" className="text-primary-gold">شروط الاستخدام</Link> و <Link href="/privacy" className="text-primary-gold">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

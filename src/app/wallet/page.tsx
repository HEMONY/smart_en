'use client';

import BottomNavigation from '@/components/layout/BottomNavigation';
import { FaCopy, FaDownload, FaUpload } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [usdEquivalent, setUsdEquivalent] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('smartCoinUser');
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      const userId = parsed.id;

      const { data, error } = await supabase
        .from('users')
        .select('balance, wallet_address, created_at')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setBalance(data.balance || 0);
        setWalletAddress(data.wallet_address || '---');

        // تحويل الرصيد إلى USD (مثلاً 1 USD لكل 10 عملات)
        setUsdEquivalent((data.balance || 0) / 10);

        // حساب عدد الأيام منذ التسجيل
        const createdDate = new Date(data.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        // إذا مرّ أكثر من 37 يومًا، فعّل السحب
        setWithdrawalEnabled(diffDays >= 37);

        // عكس عدد الأيام المتبقية
        setCountdown({
          days: Math.max(0, 37 - diffDays),
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    fetchUserData();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert('تم نسخ العنوان!');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* رأس الصفحة */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold gold-text">محفظة Smart Coin</h1>
      </header>

      {/* بطاقة الرصيد */}
      <div className="p-4">
        <div className="card">
          <h2 className="text-lg mb-2 text-center">رصيدك الحالي</h2>
          <p className="text-5xl font-bold text-center gold-text mb-2">{balance.toLocaleString('ar-EG')}</p>
          <p className="text-sm text-gray-400 text-center">${usdEquivalent.toFixed(2)} ≈</p>

          <div className="mt-6 space-y-3">
            <button className="primary-button w-full">
              <FaDownload size={18} />
              <span>إيداع</span>
            </button>

            <button
              className={`secondary-button w-full ${!withdrawalEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!withdrawalEnabled}
            >
              <FaUpload size={18} />
              <span>سحب</span>
            </button>
          </div>

          {!withdrawalEnabled && (
            <div className="mt-4">
              <p className="text-sm text-center text-gray-400 mb-2">
                السحب متاح بعد {countdown.days} يوم
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-primary-gold h-2 rounded-full"
                  style={{ width: `${(37 - countdown.days) / 37 * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* عنوان المحفظة */}
      <div className="p-4">
        <div className="card">
          <h2 className="text-lg mb-4">عنوان محفظتك الداخلية:</h2>
          <div className="wallet-address">
            <span className="text-sm">{walletAddress}</span>
            <button className="copy-button" onClick={copyToClipboard}>
              <FaCopy size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            هذا هو عنوان محفظتك الداخلية في Smart Coin. استخدمه للإيداع من محافظ خارجية.
          </p>
        </div>
      </div>

      {/* سجل المعاملات */}
      <div className="p-4">
        <div className="card">
          <h2 className="text-lg mb-4">آخر المعاملات</h2>
          {/* يمكن ربط سجل المعاملات هنا لاحقاً */}
          <p className="text-sm text-gray-400 text-center py-4">
            لا توجد معاملات حتى الآن
          </p>
        </div>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
}

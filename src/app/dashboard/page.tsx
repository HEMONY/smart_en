'use client';

import { useState, useEffect } from 'react';
import { FaCoins, FaInfoCircle } from 'react-icons/fa';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function Dashboard() {
  const [miningAvailable, setMiningAvailable] = useState(true);
  const [miningLoading, setMiningLoading] = useState(false);
  const [miningError, setMiningError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextMiningTime, setNextMiningTime] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        checkLastMining(user.id);
      }
    };
    fetchUserData();
  }, []);

  const checkLastMining = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('last_mining')
      .eq('id', userId)
      .single();

    if (data?.last_mining) {
      const lastTime = new Date(data.last_mining);
      const now = new Date();
      const diff = now.getTime() - lastTime.getTime();
      const hoursDiff = diff / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        const nextTime = new Date(lastTime.getTime() + 24 * 60 * 60 * 1000);
        setNextMiningTime(nextTime);
        setMiningAvailable(false);
        startCountdown(nextTime);
      }
    }
  };

  const startCountdown = (targetTime: Date) => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setMiningAvailable(true);
        setNextMiningTime(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleStartMining = async () => {
    if (!miningAvailable || miningLoading || !userId) return;

    setMiningLoading(true);
    setMiningError(null);

    try {
      const now = new Date().toISOString();

      // تحديث وقت التعدين
      const { error: timeError } = await supabase
        .from('users')
        .update({ last_mining: now })
        .eq('id', userId);

      if (timeError) throw timeError;

      // زيادة معدل التعدين (سيتم تحديث الرصيد تلقائيًا في قاعدة البيانات)
      const { error: rpcError } = await supabase.rpc('increment_mining_rate', {
        user_id_param: userId,
        amount_param: 1,
      });

      if (rpcError) throw rpcError;

      const nextTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      setNextMiningTime(nextTime);
      startCountdown(nextTime);
      setMiningAvailable(false);
    } catch (error: any) {
      setMiningError(error.message || 'حدث خطأ أثناء التعدين');
    } finally {
      setMiningLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold gold-text">Smart Coin</h1>
      </header>

      <div className="p-4">
        <div className="countdown-container flex justify-center gap-4 text-center">
          <div className="countdown-item"><div className="text-xl font-semibold">{countdown.days}</div><div>يوم</div></div>
          <div className="countdown-item"><div className="text-xl font-semibold">{countdown.hours}</div><div>ساعة</div></div>
          <div className="countdown-item"><div className="text-xl font-semibold">{countdown.minutes}</div><div>دقيقة</div></div>
          <div className="countdown-item"><div className="text-xl font-semibold">{countdown.seconds}</div><div>ثانية</div></div>
        </div>
      </div>

      <div className="p-4">
        {/* رسم بياني وهمي */}
        <div className="card bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-bold mb-4 text-right">نمو العملة المتوقع</h2>
          <div className="h-64 relative">
            <div className="absolute bottom-0 right-[95%] h-[95%] w-2 rounded-full bg-primary-gold"></div>
            <div className="absolute bottom-0 right-[80%] h-[75%] w-2 rounded-full bg-primary-gold"></div>
            <div className="absolute bottom-0 right-[65%] h-[50%] w-2 rounded-full bg-primary-gold"></div>
            <div className="absolute bottom-0 right-[50%] h-[35%] w-2 rounded-full bg-primary-gold"></div>
            <div className="absolute bottom-0 right-[35%] h-[20%] w-2 rounded-full bg-primary-gold"></div>
            <div className="absolute bottom-0 right-[20%] h-[10%] w-2 rounded-full bg-primary-gold"></div>
            <div className="absolute bottom-0 right-[5%] h-[5%] w-2 rounded-full bg-primary-gold"></div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center">
        <button
          className={`mining-button ${!miningAvailable || miningLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleStartMining}
          disabled={!miningAvailable || miningLoading}
        >
          {miningLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
              </svg>
              جاري التعدين...
            </span>
          ) : (
            <>
              <FaCoins size={24} />
              <span>ابدأ الآن</span>
            </>
          )}
        </button>

        {!miningAvailable && (
          <p className="text-sm text-gray-400 mt-2">
            يمكنك التعدين مرة أخرى بعد {countdown.days} يوم و {countdown.hours} ساعة و {countdown.minutes} دقيقة
          </p>
        )}

        {miningError && <p className="text-sm text-red-600 mt-2">{miningError}</p>}

        <Link href="/about" className="mt-6 secondary-button flex items-center gap-1">
          <FaInfoCircle size={18} />
          <span>تعرف على المزيد</span>
        </Link>
      </div>

      <BottomNavigation currentPath="/dashboard" />
    </div>
  );
}

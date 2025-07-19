'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const [miningAvailable, setMiningAvailable] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [balance, setBalance] = useState(0);
  const [nextMiningTime, setNextMiningTime] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchMiningStatus();
      fetchBalance();
    }
  }, [session]);

  const fetchMiningStatus = async () => {
    try {
      const response = await axios.get('/api/mining-status', {
        params: { email: session?.user?.email },
      });

      if (response.data.available) {
        setMiningAvailable(true);
        setNextMiningTime(null);
      } else {
        setMiningAvailable(false);
        setNextMiningTime(new Date(response.data.nextMiningTime));
      }
    } catch (error) {
      console.error('Error fetching mining status:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/get-balance', {
        params: { email: session?.user?.email },
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleMine = async () => {
    try {
      const response = await axios.post('/api/mine', {
        email: session?.user?.email,
      });

      if (response.data.success) {
        setMiningAvailable(false);
        setNextMiningTime(new Date(response.data.nextMiningTime));
        fetchBalance(); // تحديث الرصيد بعد التعدين
      }
    } catch (error) {
      console.error('Error mining:', error);
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

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (nextMiningTime) {
      cleanup = startCountdown(nextMiningTime);
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [nextMiningTime]);

  if (!session) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Dashboard</h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center mb-6 w-full max-w-md">
        <p className="text-xl mb-2">Your Balance</p>
        <p className="text-4xl font-bold text-green-400 mb-2">{balance} Coins</p>
        <div className="flex justify-center items-center space-x-2 mt-2">
          <Image src="/coin.svg" alt="coin" width={24} height={24} />
          <span className="text-sm text-gray-400">Earn more by mining and referrals!</span>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center w-full max-w-md">
        {miningAvailable ? (
          <button
            onClick={handleMine}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-lg"
          >
            Mine Now
          </button>
        ) : (
          <div>
            <p className="mb-2 text-yellow-400">Next mining available in:</p>
            <div className="text-2xl font-mono">
              {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <Link href="/referrals" className="underline">
          Go to Referral Page
        </Link>
      </div>
    </div>
  );
}

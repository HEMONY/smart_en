'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const DailyMiningPage = () => {
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [coinsToClaim, setCoinsToClaim] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('smartCoinUser');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserId(userObj.id);

        const { data: balanceData } = await supabase
          .from('users')
          .select('balance')
          .eq('id', userObj.id)
          .single();
        if (balanceData) {
          setUserBalance(balanceData.balance);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    const checkClaimStatus = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('mining_rate, last_mining')
          .eq('id', userId)
          .single();

        if (userData) {
          setCoinsToClaim(userData.mining_rate || 20);

          const lastClaim = userData.last_mining ? new Date(userData.last_mining).getTime() : null;
          if (lastClaim) {
            setLastClaimTime(lastClaim);
            const now = Date.now();
            const timePassed = now - lastClaim;
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (timePassed < twentyFourHours) {
              setCanClaim(false);
              setTimeLeft(twentyFourHours - timePassed);
            } else {
              setCanClaim(true);
              setTimeLeft(0);
            }
          } else {
            setCanClaim(true);
            setTimeLeft(0);
          }
        } else {
          setCanClaim(true);
          setTimeLeft(0);
        }
      } catch (error) {
        console.error('Error fetching user claim status:', error);
        setCanClaim(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkClaimStatus();
  }, [userId]);

  useEffect(() => {
    if (!canClaim && timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(intervalId);
            setCanClaim(true);
            setLastClaimTime(null);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [canClaim, timeLeft]);

  const handleClaim = useCallback(async () => {
    if (!canClaim || !userId || isLoading) return;
    setIsLoading(true);
    try {
      const now = new Date();
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_mining: now.toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      const { error: balanceUpdateError } = await supabase.rpc('increment_balance', {
        user_id_param: userId,
        amount_param: coinsToClaim,
      });

      if (!balanceUpdateError) {
        setUserBalance((prev) => (prev !== null ? prev + coinsToClaim : null));
      }

      setLastClaimTime(now.getTime());
      setCanClaim(false);
      setTimeLeft(24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Error claiming coins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [canClaim, userId, isLoading, coinsToClaim]);

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      <Card className="w-full max-w-lg shadow-xl border border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-yellow-400 animate-pulse">
            🛠️ التعدين اليومي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-400">قم بتجميع عملاتك اليومية بسهولة!</p>

          {isLoading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
              <span className="ml-3">جاري التحميل...</span>
            </div>
          ) : canClaim ? (
            <Button onClick={handleClaim} size="lg" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              🪙 احصل على {coinsToClaim} عملة
            </Button>
          ) : (
            <div>
              <p className="text-sm text-gray-400">لقد قمت بالمطالبة بالفعل اليوم. عد بعد:</p>
              <p className="text-3xl font-mono text-yellow-400 my-4 animate-pulse">{formatTimeLeft(timeLeft)}</p>
              <Button disabled size="lg" className="bg-gray-700 cursor-not-allowed">
                المطالبة غداً
              </Button>
            </div>
          )}

          {userBalance !== null && (
            <p className="text-sm text-gray-500">رصيدك الحالي: <span className="text-yellow-400 font-semibold">{userBalance} عملة</span></p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMiningPage;

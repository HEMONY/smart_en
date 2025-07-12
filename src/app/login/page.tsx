'use client';

import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // معالجة أخطاء URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [searchParams]);

  // تحميل سكربت Telegram Widget بشكل محسن
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.Login) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      console.log('Telegram Widget loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Telegram Widget');
      setErrorMessage('فشل تحميل خدمة Telegram. يرجى تحديث الصفحة.');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleTelegramLogin = async () => {
    if (!isScriptLoaded) {
      setErrorMessage('جارٍ تحميل خدمة Telegram...');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
      if (!botId) {
        throw new Error('إعدادات البوت غير صحيحة');
      }

      // إضافة معاملات إضافية للتحقق
      const authUrl = `${window.location.origin}/api/auth/telegram`;
      
      window.Telegram.Login.auth(
        { 
          bot_id: botId, 
          request_access: true,
          lang: 'ar',
          return_to: authUrl
        },
        (data) => {
          if (!data) {
            throw new Error('تم إلغاء المصادقة من قبل المستخدم');
          }
          verifyAuthData(data);
        }
      );
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بخدمة Telegram');
      console.error('Telegram auth error:', err);
    }
  };

  const verifyAuthData = async (data: any) => {
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل التحقق من البيانات');
      }

      router.push('/dashboard');
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'فشل التحقق من البيانات. يرجى المحاولة مرة أخرى.');
      console.error('Auth verification error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-black text-white">
      <div className="w-full max-w-md">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center animate-fade-in">
            {errorMessage}
            <button 
              onClick={() => setErrorMessage('')}
              className="mr-2 text-sm underline hover:text-red-400"
              aria-label="إغلاق رسالة الخطأ"
            >
              إغلاق
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <Image 
            src="/assets/smart-coin-logo.png" 
            alt="Smart Coin" 
            width={120}
            height={120}
            className="mx-auto mb-4"
            priority
            onError={() => setErrorMessage('فشل تحميل شعار التطبيق')}
          />
          <h1 className="text-3xl font-bold text-primary-gold">Smart Coin</h1>
          <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">طرق تسجيل الدخول</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2 flex items-center gap-2">
                <FaTelegramPlane className="text-blue-400" />
                تسجيل الدخول عبر Telegram
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                سجل دخولك بضغطة واحدة باستخدام حساب Telegram الخاص بك
              </p>
              <button
                onClick={handleTelegramLogin}
                disabled={isLoading || !isScriptLoaded}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg w-full transition-colors ${
                  isLoading || !isScriptLoaded 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                aria-label="تسجيل الدخول عبر Telegram"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <FaTelegramPlane size={18} />
                    <span>المتابعة مع Telegram</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2 flex items-center gap-2">
                <SiTon className="text-blue-300" />
                تسجيل الدخول عبر TON
              </h3>
              <button 
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
                onClick={() => setErrorMessage('هذه الميزة قريباً!')}
                aria-label="تسجيل الدخول عبر محفظة TON"
              >
                <SiTon size={18} />
                <span>الاتصال بالمحفظة</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-400">
          <p>باستمرارك، أنت توافق على {' '}
            <Link href="/terms" className="text-primary-gold hover:underline">الشروط</Link> {' '}
            و {' '}
            <Link href="/privacy" className="text-primary-gold hover:underline">الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: string | null): string {
  const messages = {
    telegram_auth_failed: 'فشل التحقق من بيانات Telegram. يرجى التأكد من اتصالك بالإنترنت.',
    invalid_request: 'طلب غير صالح. يرجى المحاولة مرة أخرى.',
    server_error: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    default: 'حدث خطأ غير متوقع. نعتذر عن الإزعاج.'
  };

  return error ? messages[error as keyof typeof messages] || messages.default : '';
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-black">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

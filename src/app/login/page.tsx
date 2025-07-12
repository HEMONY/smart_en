'use client';

import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// مكون محتوى الصفحة الداخلي
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // تحميل سكربت Telegram Widget بشكل ديناميكي
    const loadTelegramScript = () => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.onload = () => {
        console.log('Telegram Widget script loaded');
      };
      document.body.appendChild(script);
    };

    loadTelegramScript();
  }, []);

  useEffect(() => {
    if (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [error]);

  const handleTelegramLogin = () => {
    if (!window.Telegram) {
      setErrorMessage('جارٍ تحميل خدمة Telegram... يرجى المحاولة مرة أخرى بعد ثانية');
      return;
    }

    setIsLoading(true);
    const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    
    try {
      window.Telegram.Login.auth(
        { bot_id: botId, request_access: true },
        (data) => {
          if (data) {
            handleTelegramCallback(data);
          } else {
            setIsLoading(false);
            setErrorMessage('تم إلغاء عملية التسجيل');
          }
        }
      );
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('حدث خطأ أثناء الاتصال بخدمة Telegram');
      console.error('Telegram auth error:', err);
    }
  };

  const handleTelegramCallback = async (data: any) => {
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('فشل التحقق من البيانات. يرجى المحاولة مرة أخرى.');
      console.error('Auth error:', err);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-black text-white">
      <div className="w-full max-w-md">
        {/* عرض رسائل الخطأ */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center animate-fade-in">
            {errorMessage}
            <button 
              onClick={() => setErrorMessage('')}
              className="mr-2 text-sm underline"
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
          />
          <h1 className="text-3xl font-bold gold-text">Smart Coin</h1>
          <p className="text-gray-400 mt-2">منصة التعدين الذكية</p>
          <p className="text-gray-300 mt-4 text-sm max-w-sm mx-auto">
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                سجل الدخول باستخدام حسابك في تيليجرام بضغطة واحدة
              </p>
              <button
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg w-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="ml-2">جاري التحقق...</span>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  </span>
                ) : (
                  <>
                    <FaTelegramPlane size={20} />
                    <span>المتابعة مع تيليجرام</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                اتصل بمحفظتك الخارجية لتسجيل الدخول
              </p>
              <button 
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
                onClick={() => {
                  setErrorMessage('تسجيل الدخول عبر TON غير متاح حالياً');
                }}
              >
                <SiTon size={20} />
                <span>الاتصال بالمحفظة</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-400">
          <p>باستمرارك، أنت توافق على <Link href="/terms" className="text-primary-gold hover:underline">الشروط</Link> و <Link href="/privacy" className="text-primary-gold hover:underline">الخصوصية</Link></p>
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة لعرض رسائل الخطأ
function getErrorMessage(error: string | null): string {
  const messages: Record<string, string> = {
    'telegram_auth_failed': 'تعذر التحقق من بيانات تيليجرام. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.',
    'user_creation_failed': 'حدث خطأ أثناء إنشاء الحساب. يرجى التواصل مع الدعم.',
    'database_error': 'الخدمة غير متاحة حاليًا. نعمل على حل المشكلة.',
    'server_error': 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    'default': 'حدث خطأ غير متوقع. نعتذر عن الإزعاج.'
  };

  return error ? messages[error] || messages['default'] : '';
}

// المكون الرئيسي للصفحة
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

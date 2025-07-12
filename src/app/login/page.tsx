'use client';

import { FaTelegramPlane } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// مكون محتوى الصفحة الداخلي
function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      let errorMessage = 'حدث خطأ أثناء المصادقة';
      
      switch(error) {
        case 'telegram_auth_failed':
          errorMessage = 'فشل التحقق من بيانات تيليجرام';
          break;
        case 'user_creation_failed':
          errorMessage = 'فشل إنشاء حساب جديد';
          break;
        case 'database_error':
          errorMessage = 'خطأ في قاعدة البيانات';
          break;
        case 'server_error':
          errorMessage = 'خطأ في الخادم';
          break;
      }

      alert(errorMessage);
    }
  }, [error]);

  // إنشاء رابط المصادقة عبر Telegram
  const getTelegramAuthUrl = () => {
    const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '8002470444:AAHKFlbocuKZNxmr2sWYGfyycWNInh7spcA';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(currentOrigin)}&embed=1&request_access=write&return_to=${encodeURIComponent(`${currentOrigin}/api/auth/telegram`)}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-black text-white">
      <div className="w-full max-w-md">
        {/* رسالة الخطأ */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center">
            {getErrorMessage(error)}
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
            نحن فخورون بالإعلان عن استثمارات بقيمة 350 مليون دولار لدعم رؤيتنا. نسعى لنصبح منصة لا مركزية رائدة لتداول العملات المشفرة، وستكون عملتنا الرقمية جزءًا أساسيًا من نظام الدفع داخل المنصة.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">اختر طريقة تسجيل الدخول المفضلة لديك</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-2">تسجيل الدخول عبر تيليجرام</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام حساب تيليجرام الخاص بك. سيتم إرسال رمز تحقق إلى بوت تيليجرام الخاص بنا.
              </p>
              <Link 
                href={getTelegramAuthUrl()}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
              >
                <FaTelegramPlane size={20} />
                <span>تسجيل الدخول عبر تيليجرام</span>
              </Link>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg mb-2">تسجيل الدخول عبر محفظة TON</h3>
              <p className="text-sm text-gray-400 mb-3">
                قم بتسجيل الدخول باستخدام محفظة TON الخاصة بك. سيتم التحقق من هويتك عبر توقيع رسالة بمحفظتك.
              </p>
              <button 
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
                onClick={() => alert('سيتم تنفيذ مصادقة TON هنا')}
              >
                <SiTon size={20} />
                <span>تسجيل الدخول عبر محفظة TON</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-400">
            بالتسجيل، أنت توافق على {' '}
            <Link href="/terms" className="text-primary-gold hover:underline">شروط الاستخدام</Link> {' '}
            و {' '}
            <Link href="/privacy" className="text-primary-gold hover:underline">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة لعرض رسائل الخطأ
function getErrorMessage(error: string | null): string {
  if (!error) return '';
  
  const messages: Record<string, string> = {
    'telegram_auth_failed': 'فشل التحقق من بيانات تيليجرام. يرجى المحاولة مرة أخرى.',
    'user_creation_failed': 'فشل إنشاء حساب جديد. يرجى التواصل مع الدعم الفني.',
    'database_error': 'حدث خطأ في قاعدة البيانات. يرجى المحاولة لاحقاً.',
    'server_error': 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
    'default': 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
  };

  return messages[error] || messages['default'];
}

// المكون الرئيسي للصفحة مع Suspense Boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <LoginContent />
    </Suspense>
  );
}

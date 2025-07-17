'use client';

import BottomNavigation from '@/components/layout/BottomNavigation';
import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaInfoCircle,
  FaQuestionCircle,
  FaShieldAlt,
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // قراءة المستخدم من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('smartCoinUser');
    if (!storedUser) return;

    const userObj = JSON.parse(storedUser);
    setUserId(userObj.id);
  }, []);

  // تحميل بيانات المستخدم من Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      console.log('🔍 Fetching user with telegram_id:', userId);
      const { data, error } = await supabase
        
        .from('users')
        .select('username, telegram_id, created_at, total_coins, referrals, completed_tasks')
        .eq('telegram_id', userId)
        .single();

      if (error || !data) {
        setErrorMsg('تعذر تحميل بيانات الحساب.');
      } else {
        setUserData(data);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [userId]);

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('smartCoinUser');
    router.push('/login');
  };
  console.log('userId:', userId);

  if (!userId) {

    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-400">
        الرجاء تسجيل الدخول أولاً.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-400">
        جاري تحميل البيانات...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500 text-center p-4">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold gold-text">الملف الشخصي</h1>
      </header>

      <div className="p-4">
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-background-gray rounded-full flex items-center justify-center mr-4">
              <FaUser size={32} className="text-primary-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData.username}</h2>
              <p className="text-sm text-gray-400">{userData.telegram_id}</p>
              <p className="text-xs text-gray-500">
                عضو منذ {new Date(userData.join_date).toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-background-gray rounded-lg p-3 text-center">
              <p className="text-sm text-gray-400">العملات</p>
              <p className="text-lg font-bold gold-text">{userData.total_coins}</p>
            </div>
            <div className="bg-background-gray rounded-lg p-3 text-center">
              <p className="text-sm text-gray-400">الإحالات</p>
              <p className="text-lg font-bold gold-text">{userData.referrals}</p>
            </div>
            <div className="bg-background-gray rounded-lg p-3 text-center">
              <p className="text-sm text-gray-400">المهام</p>
              <p className="text-lg font-bold gold-text">{userData.completed_tasks}/4</p>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الإعدادات */}
      <div className="p-4">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">الإعدادات</h2>
          <div className="space-y-3">
            <button className="flex items-center justify-between w-full p-3 bg-background-gray rounded-lg">
              <div className="flex items-center">
                <FaCog className="text-primary-gold mr-3" size={18} />
                <span>إعدادات الحساب</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button className="flex items-center justify-between w-full p-3 bg-background-gray rounded-lg">
              <div className="flex items-center">
                <FaShieldAlt className="text-primary-gold mr-3" size={18} />
                <span>الأمان والخصوصية</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button className="flex items-center justify-between w-full p-3 bg-background-gray rounded-lg">
              <div className="flex items-center">
                <FaInfoCircle className="text-primary-gold mr-3" size={18} />
                <span>عن التطبيق</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button className="flex items-center justify-between w-full p-3 bg-background-gray rounded-lg">
              <div className="flex items-center">
                <FaQuestionCircle className="text-primary-gold mr-3" size={18} />
                <span>المساعدة والدعم</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* زر تسجيل الخروج */}
      <div className="p-4">
        <button className="secondary-button w-full" onClick={handleLogout}>
          <FaSignOutAlt size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      <BottomNavigation currentPath="/profile" />
    </div>
  );
}

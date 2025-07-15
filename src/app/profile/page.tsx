'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaInfoCircle,
  FaQuestionCircle,
  FaShieldAlt,
} from 'react-icons/fa';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        setErrorMsg('فشل في الحصول على المستخدم.');
        setLoading(false);
        return;
      }

      if (!user) {
        setErrorMsg('الرجاء تسجيل الدخول للوصول إلى الملف الشخصي.');
        setLoading(false);
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('users')
        .select('username, telegram_id, join_date, total_coins, referrals, completed_tasks')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        setErrorMsg('لا يمكن تحميل بيانات المستخدم. تأكد من وجود حساب في قاعدة البيانات.');
      } else {
        setUserData(data);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
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
    <div className="min-h-screen pb-20 p-4">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold gold-text">الملف الشخصي</h1>
      </header>

      <div className="card p-4 bg-background-gray rounded-lg mb-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-background-black rounded-full flex items-center justify-center mr-4">
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
          <div className="bg-background-black rounded-lg p-3 text-center">
            <p className="text-sm text-gray-400">العملات</p>
            <p className="text-lg font-bold gold-text">{userData.total_coins}</p>
          </div>
          <div className="bg-background-black rounded-lg p-3 text-center">
            <p className="text-sm text-gray-400">الإحالات</p>
            <p className="text-lg font-bold gold-text">{userData.referrals}</p>
          </div>
          <div className="bg-background-black rounded-lg p-3 text-center">
            <p className="text-sm text-gray-400">المهام</p>
            <p className="text-lg font-bold gold-text">{userData.completed_tasks}/4</p>
          </div>
        </div>
      </div>

      {/* قائمة الإعدادات */}
      <div className="card p-4 bg-background-gray rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-4">الإعدادات</h2>
        <div className="space-y-3">
          <button className="flex items-center justify-between w-full p-3 bg-background-black rounded-lg">
            <div className="flex items-center">
              <FaCog className="text-primary-gold mr-3" size={18} />
              <span>إعدادات الحساب</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="flex items-center justify-between w-full p-3 bg-background-black rounded-lg">
            <div className="flex items-center">
              <FaShieldAlt className="text-primary-gold mr-3" size={18} />
              <span>الأمان والخصوصية</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="flex items-center justify-between w-full p-3 bg-background-black rounded-lg">
            <div className="flex items-center">
              <FaInfoCircle className="text-primary-gold mr-3" size={18} />
              <span>عن التطبيق</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="flex items-center justify-between w-full p-3 bg-background-black rounded-lg">
            <div className="flex items-center">
              <FaQuestionCircle className="text-primary-gold mr-3" size={18} />
              <span>المساعدة والدعم</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      {/* زر تسجيل الخروج */}
      <div className="mb-4">
        <button className="secondary-button w-full flex items-center justify-center gap-2">
          <FaSignOutAlt size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      <BottomNavigation currentPath="/profile" />
    </div>
  );
}

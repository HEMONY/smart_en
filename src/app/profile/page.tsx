'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { FaUser, FaSignOutAlt, FaCog, FaInfoCircle, FaQuestionCircle, FaShieldAlt } from 'react-icons/fa';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from('users')
          .select('username, telegram_id, join_date, total_coins, referrals, completed_tasks')
          .eq('id', user.id)
          .single();

        if (!error) {
          setUserData(data);
        } else {
          console.error('خطأ في جلب بيانات المستخدم من قاعدة البيانات:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg text-gray-500">
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* رأس الصفحة */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold gold-text">الملف الشخصي</h1>
      </header>

      {/* معلومات المستخدم */}
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
        <button className="secondary-button w-full">
          <FaSignOutAlt size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* شريط التنقل السفلي */}
      <BottomNavigation currentPath="/profile" />
    </div>
  );
}

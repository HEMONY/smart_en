'use client';

import BottomNavigation from '@/components/layout/BottomNavigation';
import { FaTwitter, FaTelegram, FaInstagram, FaYoutube, FaCheck, FaCoins } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const TASKS = [
  { 
    id: 1, 
    title: 'متابعة حساب X (تويتر)', 
    description: 'قم بمتابعة الحساب الرسمي على منصة X', 
    icon: FaTwitter, 
    link: 'https://x.com/smartcoinoff',
    reward: 50,
  },
  { 
    id: 2, 
    title: 'متابعة قناة تيليغرام', 
    description: 'قم بمتابعة القناة الرسمية على تيليغرام', 
    icon: FaTelegram, 
    link: 'https://t.me/SMARTCOINCHANNAL',
    reward: 50,
  },
  { 
    id: 3, 
    title: 'متابعة إنستغرام', 
    description: 'قم بمتابعة الحساب الرسمي على إنستغرام', 
    icon: FaInstagram, 
    link: 'https://www.instagram.com/smartcoin_app',
    reward: 50,
  },
  { 
    id: 4, 
    title: 'الاشتراك في يوتيوب', 
    description: 'قم بالاشتراك في القناة الرسمية على يوتيوب', 
    icon: FaYoutube, 
    link: 'https://youtube.com/@smartcoinapp',
    reward: 50,
  },
];

export default function TasksPage() {
  const supabase = createClientComponentClient();

  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // جلب معرف المستخدم (يمكن تعديل حسب طريقة تخزين المستخدم)
  useEffect(() => {
    const storedUser = localStorage.getItem('smartCoinUser');
    if (!storedUser) {
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(storedUser);
    setUserId(parsed.id);
  }, []);

  // جلب حالة المهام المكتملة من Supabase عند وجود userId
  useEffect(() => {
    if (!userId) return;

    async function fetchCompletedTasks() {
      const { data, error } = await supabase
        .from('users')
        .select('completed_tasks')
        .eq('telegram_id', userId);

      if (!error && data) {
        setCompletedTasks(data.map(item => item.completed_tasks));
      } else {
        console.error('Error fetching completed tasks:', error);
      }
      setLoading(false);
    }

    fetchCompletedTasks();
  }, [userId, supabase]);

  const completeTask = async (taskId: number) => {
    if (!userId) return alert('يجب تسجيل الدخول أولاً');

    // تحقق إذا كانت المهمة مكتملة مسبقاً
    if (completedTasks.includes(taskId)) return;

    // تحديث قاعدة البيانات
    const { error } = await supabase
      .from('users')
      .insert([{ telegram_id: userId, completed_tasks: taskId }]);

    if (error) {
      console.error('Failed to mark task as completed:', error);
      alert('حدث خطأ، حاول مرة أخرى');
      return;
    }

    // تحديث الحالة محلياً
    setCompletedTasks([...completedTasks, taskId]);
  };

  const openTaskLink = (link: string, taskId: number) => {
    window.open(link, '_blank');
    completeTask(taskId); // في الواقع يجب التحقق من إكمال المهمة أولاً (يمكن عمل تحقق لاحق)
  };

  const completedCount = completedTasks.length;
  const totalReward = TASKS.filter(task => completedTasks.includes(task.id))
                           .reduce((sum, task) => sum + task.reward, 0);

  if (loading) return <div className="p-4">جارٍ التحميل...</div>;

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold gold-text">المهام</h1>
      </header>

      <div className="p-4">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">المهام المتاحة</h2>
          <div className="space-y-4">
            {TASKS.map(task => {
              const Icon = task.icon;
              const isCompleted = completedTasks.includes(task.id);
              return (
                <div key={task.id} className="task-item flex items-center">
                  <div className="task-icon">
                    <Icon size={24} />
                  </div>
                  <div className="task-content flex-grow px-4">
                    <h3 className="task-title">{task.title}</h3>
                    <p className="task-description">{task.description}</p>
                  </div>
                  <div className="task-reward flex items-center mr-4">
                    <FaCoins className="inline mr-1" size={14} />
                    {task.reward}
                  </div>
                  {isCompleted ? (
                    <button className="primary-button ml-2 px-3 py-2" disabled>
                      <FaCheck size={16} />
                    </button>
                  ) : (
                    <button 
                      className="primary-button ml-2 px-3 py-2"
                      onClick={() => openTaskLink(task.link, task.id)}
                    >
                      <span>متابعة</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">إحصائيات المهام</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">المهام المكتملة</p>
              <p className="text-xl font-bold gold-text">
                {completedCount}/{TASKS.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">المكافآت المكتسبة</p>
              <p className="text-xl font-bold gold-text">
                <FaCoins className="inline mr-1" size={14} />
                {totalReward}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation currentPath="/tasks" />
    </div>
  );
}

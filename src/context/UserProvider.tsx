'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserContextType {
  user: any | null;
  setUser: (user: any | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error('فشل في جلب المستخدم:', error);
      setUser(data?.user ?? null);
    };

    getUser();

    // مراقبة تغيّر الجلسة
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}

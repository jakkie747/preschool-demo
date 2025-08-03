
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from "@/lib/firebase";
import { getTeacherByUid } from '@/services/teacherService';
import type { Teacher } from '@/lib/types';

interface AdminAuthContextType {
  user: User | null;
  teacher: Teacher | null;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        router.replace('/admin');
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
            const teacherProfile = await getTeacherByUid(user.uid);
            setTeacher(teacherProfile);
        } catch (error) {
            console.error("Failed to fetch teacher profile:", error);
            setTeacher(null);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setTeacher(null);
        setLoading(false);
        router.replace('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const value = { user, teacher, loading };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

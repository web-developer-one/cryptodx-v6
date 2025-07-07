
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import * as auth from '@/lib/auth';
import { useToast } from './use-toast';
import { useLanguage } from './use-language';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'pricePlan' | 'avatar'>) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  setSelectedAvatar: (avatarUrl: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleAuthAction = useCallback(async (action: Promise<User | null>, successTitle: string, successDescription: string, errorTitle: string) => {
    try {
      const userData = await action;
      if (userData) {
        setUser(userData);
        localStorage.setItem('userId', userData.id);
        toast({ title: successTitle, description: successDescription });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ variant: 'destructive', title: errorTitle, description: error.message });
      return false;
    }
  }, [toast]);

  const login = useCallback(async (email: string, password: string) => {
    const success = await handleAuthAction(
      auth.login(email, password),
      t('LoginPage.loginSuccessTitle'),
      t('LoginPage.loginSuccessUser'),
      t('LoginPage.loginErrorTitle')
    );
    if (!success) {
      toast({ variant: 'destructive', title: t('LoginPage.loginErrorTitle'), description: t('LoginPage.loginErrorInvalid') });
    }
    return success;
  }, [handleAuthAction, t]);

  const register = useCallback(async (userData: Omit<User, 'id' | 'pricePlan' | 'avatar'>) => {
    const success = await handleAuthAction(
      auth.register({ ...userData, avatar: auth.avatars[0] }),
      t('RegisterPage.registerSuccessTitle'),
      t('RegisterPage.registerSuccessUser'),
      t('RegisterPage.registerErrorTitle')
    );
    if (!success) {
       toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: t('RegisterPage.registerErrorExists') });
    }
    return success;
  }, [handleAuthAction, t]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    if (!user) return false;
    const success = await handleAuthAction(
      auth.updateUser(user.id, profileData),
      t('ProfilePage.saveSuccessTitle'),
      t('ProfilePage.saveSuccessDescription'),
      'Profile Update Failed'
    );
    return success;
  }, [user, handleAuthAction, t]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userId');
    toast({ description: t('LogoutToast.description') });
    router.push('/');
  }, [router, t, toast]);
  
  const setSelectedAvatar = (avatarUrl: string) => {
    if(user) {
        setUser({...user, avatar: avatarUrl});
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userData = await auth.getUser(userId);
        if (userData) {
          setUser(userData);
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    setSelectedAvatar,
  }), [user, isLoading, login, logout, register, updateProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

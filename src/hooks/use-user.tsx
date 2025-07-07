
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const userData = await auth.login(email, password);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('userId', userData.id);
        
        const successTitle = t('LoginPage.loginSuccessTitle');
        const successDescription = userData.pricePlan === 'Administrator' 
            ? t('LoginPage.loginSuccessAdmin') 
            : t('LoginPage.loginSuccessUser');
            
        toast({ title: successTitle, description: successDescription });
        return true;
      } else {
        toast({ variant: 'destructive', title: t('LoginPage.loginErrorTitle'), description: t('LoginPage.loginErrorInvalid') });
        return false;
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('LoginPage.loginErrorTitle'), description: error.message });
      return false;
    }
  }, [t, toast]);

  const register = useCallback(async (userData: Omit<User, 'id' | 'pricePlan' | 'avatar'>) => {
    try {
      const newUser = await auth.register({ ...userData, avatar: auth.avatars[0] });
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('userId', newUser.id);
        toast({ title: t('RegisterPage.registerSuccessTitle'), description: t('RegisterPage.registerSuccessUser') });
        return true;
      } else {
        toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: t('RegisterPage.registerErrorExists') });
        return false;
      }
    } catch (error: any) {
       toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: error.message });
       return false;
    }
  }, [t, toast]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    if (!user) return false;
     try {
      const updatedUser = await auth.updateUser(user.id, profileData);
      if (updatedUser) {
        setUser(updatedUser);
        toast({ title: t('ProfilePage.saveSuccessTitle'), description: t('ProfilePage.saveSuccessDescription') });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Profile Update Failed', description: error.message });
      return false;
    }
  }, [user, t, toast]);

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

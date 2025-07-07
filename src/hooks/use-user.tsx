
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/lib/types';
import { useToast } from './use-toast';
import { useLanguage } from './use-language';
import { get, set, keys } from 'idb-keyval';

export const avatars = [
  '/avatars/admin-avatar.png',
  '/avatars/male-01-avatar.png',
  '/avatars/female-01-avatar.png',
  '/avatars/male-02-avatar.png'
];

const initialUsers: User[] = [
  {
    id: '1',
    username: 'Admin',
    email: 'saytee.software@gmail.com',
    password: 'password', // Hashed in a real app
    firstName: 'Larry',
    lastName: 'Saytee',
    age: 49,
    sex: 'Male',
    pricePlan: 'Administrator',
    avatar: avatars[0],
  },
];

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
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const initializeDb = async () => {
      const allKeys = await keys();
      if (!allKeys.includes('users')) {
        await set('users', initialUsers);
      }
    };
    initializeDb();
  }, []);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const users = await get<User[]>('users');
        const userData = users?.find(u => u.id === userId);
        if (userData) {
          setUser(userData);
        } else {
            localStorage.removeItem('userId');
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const users = await get<User[]>('users') || [];
    const userData = users.find(u => u.email === email && u.password === password);

    if (userData) {
      setUser(userData);
      localStorage.setItem('userId', userData.id);
      toast({
        title: t('LoginPage.loginSuccessTitle'),
        description: userData.pricePlan === 'Administrator' ? t('LoginPage.loginSuccessAdmin') : t('LoginPage.loginSuccessUser'),
      });
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: t('LoginPage.loginErrorTitle'),
        description: t('LoginPage.loginErrorInvalid'),
      });
      return false;
    }
  }, [t, toast]);


  const register = useCallback(async (userData: Omit<User, 'id' | 'pricePlan' | 'avatar'>) => {
    try {
      const users = await get<User[]>('users') || [];
      if (users.some(u => u.email === userData.email)) {
        toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: t('RegisterPage.registerErrorExists') });
        return false;
      }

      const newUser: User = {
        id: (Date.now()).toString(),
        ...userData,
        pricePlan: 'Free',
        avatar: avatars[1], 
      };

      const newUsers = [...users, newUser];
      await set('users', newUsers);

      setUser(newUser);
      localStorage.setItem('userId', newUser.id);
      toast({ title: t('RegisterPage.registerSuccessTitle'), description: t('RegisterPage.registerSuccessUser') });
      return true;

    } catch (error: any) {
       toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: error.message });
       return false;
    }
  }, [t, toast]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    if (!user) return false;
     try {
      let users = await get<User[]>('users') || [];
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex !== -1) {
        const { email, ...updatableData } = profileData;
        const updatedUser = { ...users[userIndex], ...updatableData };
        users[userIndex] = updatedUser;
        await set('users', users);
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
  
  const setSelectedAvatar = useCallback((avatarUrl: string) => {
    setUser(currentUser => {
        if (currentUser) {
            return {...currentUser, avatar: avatarUrl};
        }
        return null;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userId');
    toast({ description: t('LogoutToast.description') });
  }, [t, toast]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    setSelectedAvatar,
  }), [user, isLoading, login, logout, register, updateProfile, setSelectedAvatar]);

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

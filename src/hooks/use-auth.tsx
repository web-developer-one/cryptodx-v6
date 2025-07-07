
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import type { UserProfile } from '@/lib/types';
import { useLanguage } from './use-language';

const MOCK_ADMIN_EMAIL = 'saytee.software@gmail.com';
const MOCK_ADMIN_PASSWORD = 'password';

const USERS_STORAGE_KEY = 'crypto_users';
const SESSION_STORAGE_KEY = 'crypto_session';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  register: (username: string, email: string, pass: string) => void;
  updateProfile: (profileData: Partial<UserProfile>) => void;
  setSessionUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const sessionUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): UserProfile[] => {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Failed to get users from localStorage", error);
      return [];
    }
  };

  const saveUsers = (users: UserProfile[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users to localStorage", error);
    }
  };

  const login = useCallback((email: string, pass: string) => {
    // Special admin login
    if (email.toLowerCase() === MOCK_ADMIN_EMAIL && pass === MOCK_ADMIN_PASSWORD) {
        const adminUser: UserProfile = {
            id: 'admin-user-01',
            username: 'Admin',
            firstName: 'Larry',
            lastName: 'Saytee',
            email: MOCK_ADMIN_EMAIL,
            age: null,
            avatar: '',
            pricingPlan: 'Administrator',
            isAdmin: true,
        };
        setUser(adminUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
        toast({ title: t('LoginPage.loginSuccessTitle'), description: t('LoginPage.loginSuccessAdmin') });
        router.push('/profile');
        return;
    }

    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // NOTE: In a real app, passwords should be hashed and verified on a server.
    // This is a mock implementation for prototyping.
    if (foundUser) {
      // For this prototype, we don't store passwords, so any password is "correct" for a registered user.
      setUser(foundUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(foundUser));
      toast({ title: t('LoginPage.loginSuccessTitle'), description: t('LoginPage.loginSuccessUser') });
      router.push('/profile');
    } else {
      toast({ variant: 'destructive', title: t('LoginPage.loginErrorTitle'), description: t('LoginPage.loginErrorInvalid') });
    }
  }, [router, toast, t]);

  const register = useCallback((username: string, email: string, pass: string) => {
    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: t('RegisterPage.registerErrorExists') });
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username,
      email,
      firstName: '',
      lastName: '',
      age: null,
      avatar: '',
      pricingPlan: 'Free',
      isAdmin: false,
    };

    users.push(newUser);
    saveUsers(users);
    
    // Log the new user in
    setUser(newUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    toast({ title: t('RegisterPage.registerSuccessTitle'), description: t('RegisterPage.registerSuccessUser') });
    router.push('/profile');
  }, [router, toast, t]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    toast({ title: t('Header.logout'), description: t('LogoutToast.description') });
    router.push('/');
  }, [router, toast, t]);

  const updateProfile = useCallback((profileData: Partial<UserProfile>) => {
    setUser(currentUser => {
      if (!currentUser) return null;

      const updatedUser = { ...currentUser, ...profileData } as UserProfile;
      
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUsers(users);
      } else if (updatedUser.isAdmin) {
        // Admin user might not be in the list, no need to save
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      toast({ title: t('ProfilePage.saveSuccessTitle'), description: t('ProfilePage.saveSuccessDescription') });
      
      return updatedUser;
    });
  }, [toast, t]);

  const setSessionUser = useCallback((data: Partial<UserProfile>) => {
    setUser(currentUser => {
      if (!currentUser) return null; // Can't update a non-existent user
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    setSessionUser,
  }), [user, isLoading, login, logout, register, updateProfile, setSessionUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

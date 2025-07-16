
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/lib/types';
import { useToast } from './use-toast';
import { useLanguage } from './use-language';
import { avatars } from '@/lib/constants';

export { avatars };

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
  updateProfile: (profileData: Partial<Omit<User, 'id'>>) => Promise<boolean>;
  setSelectedAvatar: (avatarUrl: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchUser = useCallback(async (userId: string) => {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
        } else {
            console.error('Failed to fetch user session, logging out.');
            localStorage.removeItem('userId');
            setUser(null);
        }
    } catch (error) {
        console.error('Error fetching user session:', error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        fetchUser(userId);
    } else {
        setIsLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('userId', data.id);
        toast({
            title: t('LoginPage.loginSuccessTitle'),
            description: data.pricePlan === 'Administrator' ? t('LoginPage.loginSuccessAdmin') : t('LoginPage.loginSuccessUser'),
        });
        return true;
      } else {
        toast({
            variant: 'destructive',
            title: t('LoginPage.loginErrorTitle'),
            description: data.error || t('LoginPage.loginErrorInvalid'),
        });
        return false;
      }
    } catch (error) {
        toast({ variant: 'destructive', title: t('LoginPage.loginErrorTitle'), description: 'A connection error occurred.' });
        return false;
    } finally {
        setIsLoading(false);
    }
  }, [t, toast]);


  const register = useCallback(async (userData: Omit<User, 'id'>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 201) {
        setUser(data);
        localStorage.setItem('userId', data.id);
        toast({ title: t('RegisterPage.registerSuccessTitle'), description: t('RegisterPage.registerSuccessUser') });
        return true;
      } else {
        toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: data.error || 'An unknown error occurred.' });
        return false;
      }
    } catch (error) {
       toast({ variant: 'destructive', title: t('RegisterPage.registerErrorTitle'), description: 'A connection error occurred.' });
       return false;
    } finally {
        setIsLoading(false);
    }
  }, [t, toast]);

  const updateProfile = useCallback(async (profileData: Partial<Omit<User, 'id'>>) => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        toast({ title: t('ProfilePage.saveSuccessTitle'), description: t('ProfilePage.saveSuccessDescription') });
        return true;
      } else {
        toast({ variant: 'destructive', title: t('ProfilePage.saveErrorTitle'), description: data.error || 'Failed to update profile.' });
        return false;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: t('ProfilePage.saveErrorTitle'), description: 'A connection error occurred.' });
      return false;
    } finally {
      setIsLoading(false);
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

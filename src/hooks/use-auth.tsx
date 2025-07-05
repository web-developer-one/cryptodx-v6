
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/lib/types';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

// For this simulation, we'll store users in localStorage.
// This is NOT secure for a real production app, but sufficient for this prototype.
const USERS_STORAGE_KEY = 'crypto_swap_users';
const CURRENT_USER_STORAGE_KEY = 'crypto_swap_current_user';

// --- Auth Context Definition ---
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'avatar'> & { password: string }) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);


// --- Auth Provider Component ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // On initial load, check localStorage for a logged-in user.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Hardcoded admin check
    if (email.toLowerCase() === 'saytee.software@gmail.com' && password === 'admin') {
      const adminUser: User = {
        id: 'admin_user',
        firstName: 'Admin',
        lastName: 'User',
        email: 'saytee.software@gmail.com',
        avatar: 'avatar1',
        isAdmin: true,
      };
      setUser(adminUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(adminUser));
      toast({ title: 'Welcome, Administrator!' });
      return true;
    }

    // Regular user check
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const foundUser = storedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (foundUser) {
      const { password: _, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
      toast({ title: 'Login Successful', description: `Welcome back, ${userToStore.firstName}!` });
      return true;
    }

    toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
    return false;
  }, [toast]);
  
  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    // This is a simulation of a Google SSO flow.
    // In a real app, this would involve a popup, redirect, and token handling.
    const googleUser: User = {
        id: 'google_user_simulated',
        firstName: 'Google',
        lastName: 'User',
        email: 'user@google.com',
        avatar: 'avatar4', // Robot avatar for fun
        isAdmin: false,
    };

    setUser(googleUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(googleUser));
    toast({ title: 'Login Successful', description: 'Welcome! You have signed in with Google.' });
    return true;
  }, [toast]);


  const register = useCallback(async (userData: Omit<User, 'id' | 'avatar'> & { password: string }): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const existingUser = storedUsers.find((u: any) => u.email.toLowerCase() === userData.email.toLowerCase());

    if (existingUser) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'An account with this email already exists.' });
      return false;
    }

    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      avatar: 'avatar1', // Default avatar
    };

    storedUsers.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
    
    // Automatically log in the new user
    const { password: _, ...userToStore } = newUser;
    setUser(userToStore);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    
    toast({ title: 'Registration Successful', description: `Welcome, ${newUser.firstName}!` });
    return true;
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
  }, [toast, router]);

  const updateProfile = useCallback(async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));

    // Also update the user in the main user list (if not admin)
    if (!user.isAdmin) {
        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
            // We need to keep the password, so we merge
            const oldUser = storedUsers[userIndex];
            storedUsers[userIndex] = { ...oldUser, ...updatedData };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
        }
    }

    toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    return true;
  }, [user, toast]);

  const value = useMemo(() => ({
    user,
    isAdmin: user?.isAdmin || false,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    register,
    updateProfile,
  }), [user, isLoading, login, loginWithGoogle, logout, register, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Auth Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

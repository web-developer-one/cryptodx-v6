
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import type { User } from '@/lib/types';
import { useToast } from './use-toast';
import { auth } from '@/lib/firebase';

// We'll still use localStorage for profile data to avoid needing a full database setup for this prototype.
const USER_PROFILE_STORAGE_PREFIX = 'crypto_swap_user_profile_';

// --- Auth Context Definition ---
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'avatar' | 'email' | 'pricingPlan'> & { email: string, password: string }) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const authNotConfiguredToast = (toast: any) => {
    toast({
      variant: 'destructive',
      title: 'Authentication Not Configured',
      description: 'Please add your Firebase credentials to a .env.local file and restart the development server to use this feature.',
      duration: 10000,
    });
};


// --- Auth Provider Component ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // This useEffect will run once on the client and show a persistent toast if Firebase isn't configured.
  useEffect(() => {
      if (!auth) {
          authNotConfiguredToast(toast);
      }
  }, [toast]);

  const handleAuthError = useCallback((error: any, context: 'Login' | 'Google Login' | 'Registration') => {
    console.error(`${context} failed:`, error);

    if (error.code === 'auth/operation-not-allowed') {
        toast({
            variant: 'destructive',
            title: 'Sign-in Method Disabled',
            description: `The ${context === 'Google Login' ? 'Google' : 'Email/Password'} provider is disabled. Please enable it in your Firebase project console under Authentication > Sign-in method.`,
            duration: 10000,
        });
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast({ variant: 'destructive', title: `${context} Failed`, description: 'Invalid email or password.' });
    }
    else {
        toast({ variant: 'destructive', title: `${context} Failed`, description: error.message || `An unexpected error occurred.` });
    }
  }, [toast]);

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    const storedProfile = localStorage.getItem(`${USER_PROFILE_STORAGE_PREFIX}${firebaseUser.uid}`);
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
    
    // If no profile exists (e.g., first-time Google sign-in), create one.
    const [firstName, lastName] = firebaseUser.displayName?.split(' ') || [firebaseUser.email?.split('@')[0] || 'New', 'User'];
    const newProfile: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      firstName,
      lastName,
      avatar: 'avatar1',
      pricingPlan: 'Free',
    };
    localStorage.setItem(`${USER_PROFILE_STORAGE_PREFIX}${firebaseUser.uid}`, JSON.stringify(newProfile));
    return newProfile;
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    // Check for a mock admin session first on initial load
    const mockAdminData = localStorage.getItem('mock_admin_user');
    if (mockAdminData) {
        setUser(JSON.parse(mockAdminData));
        setIsLoading(false);
        return; // Skip Firebase listener if mock admin is active
    }
    
    // If firebase is not configured, we are not loading a user.
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Special case for admin login
    if (email === 'saytee.software@gmail.com' && password === 'admin') {
      const adminUser: User = {
        id: 'admin-user-id',
        email: 'saytee.software@gmail.com',
        firstName: 'Admin',
        lastName: 'User',
        avatar: 'avatar4', // Robot avatar
        isAdmin: true,
        pricingPlan: 'Administrator',
      };
      // Manually set user state and store in local storage to simulate a session
      setUser(adminUser);
      localStorage.setItem('mock_admin_user', JSON.stringify(adminUser));
      toast({ title: 'Admin Login Successful', description: 'Welcome, Administrator!' });
      return true;
    }

    if (!auth) {
      authNotConfiguredToast(toast);
      return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Clear any mock admin session if a real login succeeds
      localStorage.removeItem('mock_admin_user');
      toast({ title: 'Login Successful', description: `Welcome back!` });
      return true;
    } catch (error: any) {
      handleAuthError(error, 'Login');
      return false;
    }
  }, [toast, handleAuthError]);
  
  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    if (!auth) {
      authNotConfiguredToast(toast);
      return false;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Clear any mock admin session if a real login succeeds
      localStorage.removeItem('mock_admin_user');
      toast({ title: 'Login Successful', description: 'Welcome! You have signed in with Google.' });
      return true;
    } catch (error: any) {
      handleAuthError(error, 'Google Login');
      return false;
    }
  }, [toast, handleAuthError]);

  const register = useCallback(async (userData: Omit<User, 'id' | 'avatar' | 'email' | 'pricingPlan'> & { email: string, password: string }): Promise<boolean> => {
    if (!auth) {
      authNotConfiguredToast(toast);
      return false;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const firebaseUser = userCredential.user;

        // Create and store the user profile immediately after registration
        const newProfile: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: 'avatar1',
            pricingPlan: 'Free',
        };
        localStorage.setItem(`${USER_PROFILE_STORAGE_PREFIX}${firebaseUser.uid}`, JSON.stringify(newProfile));
        setUser(newProfile); // Set user in state right away

        toast({ title: 'Registration Successful', description: `Welcome, ${newProfile.firstName}!` });
        return true;
    } catch (error: any) {
        handleAuthError(error, 'Registration');
        return false;
    }
  }, [toast, handleAuthError]);

  const logout = useCallback(async () => {
    // Clear mock admin user from localStorage
    localStorage.removeItem('mock_admin_user');

    if (!auth) {
      authNotConfiguredToast(toast);
      // If firebase isn't configured, we still need to clear local state
      setUser(null);
      router.push('/');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      return;
    }
    await signOut(auth);
    router.push('/');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }, [toast, router]);

  const updateProfile = useCallback(async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    // Security check: Prevent non-admin users from assigning themselves the Administrator plan.
    if (updatedData.pricingPlan === 'Administrator' && !user.isAdmin) {
      console.warn("Security Alert: A non-admin user attempted to gain Administrator privileges. Operation blocked.");
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You cannot assign this plan.',
      });
      return false;
    }

    // If the user is the mock admin, update the mock data in localStorage
    if (user.isAdmin) {
      const updatedAdmin = { ...user, ...updatedData };
      setUser(updatedAdmin);
      localStorage.setItem('mock_admin_user', JSON.stringify(updatedAdmin));
      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      return true;
    }

    // For real users, update the standard profile
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem(`${USER_PROFILE_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedUser));
    
    toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    return true;
  }, [user, toast]);

  const value = useMemo(() => ({
    user,
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


'use server';
// This is a mock authentication service. In a real app, this would be a database.
import type { User } from './types';

export const avatars = [
  '/avatars/avatar_1.png',
  '/avatars/avatar_2.png',
  '/avatars/avatar_3.png',
  '/avatars/avatar_4.png',
  '/avatars/avatar_5.png',
  '/avatars/avatar_6.png',
  '/avatars/avatar_7.png',
  '/avatars/avatar_8.png',
];

let users: User[] = [
  {
    id: '1',
    username: 'Admin',
    email: 'saytee.software@gmail.com',
    password: 'password', // In a real app, this would be hashed
    firstName: 'Larry',
    lastName: 'Saytee',
    age: 49,
    sex: 'Male',
    pricePlan: 'Administrator',
    avatar: avatars[0],
  },
  {
    id: '2',
    username: 'satoshi',
    email: 'satoshi@nakamoto.com',
    password: 'password',
    firstName: 'Satoshi',
    lastName: 'Nakamoto',
    age: 35,
    sex: 'Male',
    pricePlan: 'Advanced',
    avatar: avatars[1],
  },
    {
    id: '3',
    username: 'testuser',
    email: 'test@user.com',
    password: 'password',
    firstName: 'Test',
    lastName: 'User',
    age: 28,
    sex: 'Male',
    pricePlan: 'Free',
    avatar: avatars[2],
  },
];

export async function login(email: string, password: string):Promise<User | null> {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        // Return a copy to avoid direct mutation
        return { ...user };
    }
    return null;
}

export async function register(userData: Omit<User, 'id' | 'pricePlan'>): Promise<User | null> {
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists
    }
    const newUser: User = {
        id: (users.length + 1).toString(),
        ...userData,
        pricePlan: 'Free', // Default plan
    };
    users.push(newUser);
    return { ...newUser };
}

export async function updateUser(userId: string, profileData: Partial<User>): Promise<User | null> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        // Exclude email from being updated
        const { email, ...updatableData } = profileData;
        users[userIndex] = { ...users[userIndex], ...updatableData };
        return { ...users[userIndex] };
    }
    return null;
}

export async function getUser(userId: string): Promise<User | null> {
    const user = users.find(u => u.id === userId);
    return user ? { ...user } : null;
}

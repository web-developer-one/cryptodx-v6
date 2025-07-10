
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';
import { avatars } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const userStore = getStore('users');
        const userKey = email.toLowerCase();
        let user: User | null = await userStore.get(userKey, { type: 'json' }) as User | null;

        // Special check to create the admin user if it doesn't exist on first login
        if (!user && userKey === 'saytee.software@gmail.com' && password === 'admin') {
            const adminUser: User = {
                id: crypto.randomUUID(),
                email: userKey,
                username: 'Administrator',
                password: 'admin', // Storing plain text as per current app design
                firstName: 'Admin',
                lastName: 'User',
                age: 0,
                sex: '',
                pricePlan: 'Administrator',
                avatar: avatars[0],
            };
            await userStore.setJSON(userKey, adminUser);
            // Use the newly created admin user object directly for the session
            user = adminUser;
        }
        
        // In a real app, passwords should be hashed and compared securely.
        // For this simulation, we are comparing plain text passwords.
        if (user && user.password === password) {
            // Never send the password back to the client
            const { password: _, ...userWithoutPassword } = user;
            return NextResponse.json(userWithoutPassword);
        } else {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}

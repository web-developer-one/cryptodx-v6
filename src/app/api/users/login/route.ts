
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';
import { avatars } from '@/lib/constants';
import { createUser } from '@/lib/user-actions';

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
            const adminData: Omit<User, 'id'> = {
                email: userKey,
                username: 'Administrator',
                password: 'admin', // In a real app, this should be hashed
                firstName: 'Admin',
                lastName: 'User',
                age: 0,
                sex: '',
                pricePlan: 'Administrator',
                avatar: avatars[0],
            };
            // Correctly assign the newly created user to the user variable
            user = await createUser(adminData);
        }
        
        if (user && user.password === password) {
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

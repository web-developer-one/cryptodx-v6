
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const userStore = getStore('users');
        const userKey = email.toLowerCase();
        const user = await userStore.get(userKey, { type: 'json' }) as User | null;
        
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

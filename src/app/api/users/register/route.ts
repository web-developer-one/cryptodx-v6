
'use server';
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const newUser: Omit<User, 'id'> = await request.json();

        if (!newUser.email || !newUser.password || !newUser.username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userStore = getStore('users');
        const userKey = newUser.email.toLowerCase();

        // Check if user already exists
        const existingUser = await userStore.get(userKey);
        if (existingUser) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }
        
        // A simple, environment-agnostic UUID generator
        const simpleUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        const createdUser: User = {
            id: simpleUUID(),
            ...newUser
        };

        await userStore.setJSON(userKey, createdUser);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = createdUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}

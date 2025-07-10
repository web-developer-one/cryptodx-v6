
'use server';
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';
import { createUser } from '@/lib/user-actions';

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

        const createdUser = await createUser(newUser);

        const { password, ...userWithoutPassword } = createdUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}

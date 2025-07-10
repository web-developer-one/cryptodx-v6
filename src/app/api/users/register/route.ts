
'use server';
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

// Helper function to create a user. This can be used by both register and login routes.
export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
    const userStore = getStore('users');
    const userKey = userData.email.toLowerCase();

    // In a real production environment, this should be a more robust UUID library
    const simpleUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const userToStore: User = {
        id: simpleUUID(), // Use the compatible UUID generator
        ...userData
    };

    await userStore.setJSON(userKey, userToStore);
    return userToStore;
}


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


import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

// Get a single user by ID. Note: We store by email, so this requires a lookup.
// This is inefficient and in a real DB you'd query by ID directly.
async function getUserBy(field: 'id' | 'email', value: string): Promise<User | null> {
    const userStore = getStore('users');
    if (field === 'email') {
        return await userStore.get(value.toLowerCase(), { type: 'json' }) as User | null;
    }
    
    // Inefficient lookup for ID
    const { blobs } = await userStore.list();
    for (const blob of blobs) {
        const user = await userStore.get(blob.key, { type: 'json' }) as User;
        if (user && user.id === value) {
            return user;
        }
    }
    return null;
}


// GET a user profile
export async function GET(request: Request, { params }: { params: { userId: string } }) {
    try {
        const user = await getUserBy('id', params.userId);
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE a user profile
export async function PUT(request: Request, { params }: { params: { userId: string } }) {
    try {
        const updates: Partial<User> = await request.json();
        
        // Fetch the user to get their email (key for blob store)
        const existingUser = await getUserBy('id', params.userId);

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Email cannot be changed as it's the key
        if(updates.email && updates.email !== existingUser.email) {
            return NextResponse.json({ error: 'Email address cannot be changed' }, { status: 400 });
        }

        const updatedUser: User = { ...existingUser, ...updates };

        const userStore = getStore('users');
        await userStore.setJSON(existingUser.email.toLowerCase(), updatedUser);
        
        const { password, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

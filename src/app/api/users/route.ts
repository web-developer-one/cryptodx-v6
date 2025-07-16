
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

// GET all users (this should be admin-protected in a real app)
export async function GET() {
    try {
        const userStore = getStore('users');
        const { blobs } = await userStore.list();
        
        const users: Omit<User, 'password'>[] = [];

        for (const blob of blobs) {
            const userData = await userStore.get(blob.key, { type: 'json' }) as User;
            if (userData) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...userWithoutPassword } = userData;
                users.push(userWithoutPassword);
            }
        }
        
        // Sort users by registration date if available, otherwise by username
        users.sort((a, b) => a.username.localeCompare(b.username));

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error fetching all users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


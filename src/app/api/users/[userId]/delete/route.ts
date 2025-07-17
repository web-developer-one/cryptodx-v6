
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

const ADMIN_EMAIL = 'saytee.software@gmail.com';

async function getUserByEmail(email: string): Promise<User | null> {
    const userStore = getStore('users');
    return await userStore.get(email.toLowerCase(), { type: 'json' }) as User | null;
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
    try {
        const userStore = getStore('users');
        const { blobs } = await userStore.list();
        let userToDelete: User | null = null;
        let userKey: string | null = null;

        for (const blob of blobs) {
            const user = await userStore.get(blob.key, { type: 'json' }) as User;
            if (user && user.id === params.userId) {
                userToDelete = user;
                userKey = blob.key;
                break;
            }
        }
        
        if (!userToDelete || !userKey) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Protect the admin account from being deleted
        if (userToDelete.email.toLowerCase() === ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Cannot delete the administrator account' }, { status: 403 });
        }
        
        await userStore.delete(userKey);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

    
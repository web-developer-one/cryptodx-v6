
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
            try {
                const userData = await userStore.get(blob.key, { type: 'json' }) as User;
                if (userData) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { password, ...userWithoutPassword } = userData;
                    users.push(userWithoutPassword);
                }
            } catch (e) {
                // Log if a specific blob is malformed, but don't crash
                console.warn(`Could not parse blob with key: ${blob.key}`);
            }
        }
        
        // Sort users by registration date if available, otherwise by username
        users.sort((a, b) => a.username.localeCompare(b.username));

        return NextResponse.json(users);

    } catch (error: any) {
        // Specifically catch the MissingBlobsEnvironmentError during build time
        if (error.name === 'MissingBlobsEnvironmentError') {
            console.warn('Netlify Blobs environment not available, returning empty user list.');
            return NextResponse.json([]); // Return empty array to prevent build failure
        }
        console.error('Error fetching all users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

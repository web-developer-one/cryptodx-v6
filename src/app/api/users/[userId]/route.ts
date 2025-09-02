
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

// Helper function to find a user by their ID, since blobs are keyed by email.
// This is inefficient but necessary for this data structure.
// In a real database, you'd query by ID directly.
async function findUserById(userId: string): Promise<{user: User; key: string} | null> {
    const userStore = getStore('users');
    const { blobs } = await userStore.list();

    for (const blob of blobs) {
        try {
            const user = await userStore.get(blob.key, { type: 'json' }) as User;
            if (user && user.id === userId) {
                return { user, key: blob.key };
            }
        } catch (e) {
            console.error(`Error parsing blob with key ${blob.key}`, e);
        }
    }
    return null;
}


// GET a user profile by ID
export async function GET(request: Request, { params }: { params: { userId: string } }) {
    try {
        const result = await findUserById(params.userId);
        
        if (!result) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = result.user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE a user profile by ID
export async function PUT(request: Request, { params }: { params: { userId: string } }) {
    try {
        const updates: Partial<User> = await request.json();
        
        // Find the user by ID to get their existing data and blob key (email)
        const findResult = await findUserById(params.userId);

        if (!findResult) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { user: existingUser, key: userKey } = findResult;

        // Email cannot be changed as it's the key.
        if (updates.email && updates.email.toLowerCase() !== userKey) {
            return NextResponse.json({ error: 'Email address cannot be changed' }, { status: 400 });
        }

        // Merge the updates with the existing user data
        const updatedUser: User = { ...existingUser, ...updates };

        // Save the updated user object back to the blob store using its key (email)
        const userStore = getStore('users');
        await userStore.setJSON(userKey, updatedUser);
        
        // Return the updated user data, omitting the password for security
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

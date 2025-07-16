
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';
import { avatars } from '@/lib/constants';

// This is a simplified UUID generator that is compatible with various JS environments.
// It is more reliable in serverless functions than crypto.randomUUID().
const generateUUID = () => {
    let
        d = new Date().getTime(),
        d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};

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
        if (userKey === 'saytee.software@gmail.com' && password === 'admin') {
            if (!user) {
                const adminData: User = {
                    id: generateUUID(),
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
                
                await userStore.setJSON(userKey, adminData);
                // ** CRITICAL FIX: Assign the newly created admin data to the user variable **
                user = adminData;
            }
        }
        
        if (user && user.password === password) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

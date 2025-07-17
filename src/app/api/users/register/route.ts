import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';
import { Resend } from 'resend';

// This is a simplified UUID generator that is compatible with various JS environments.
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
        
        const createdUser: User = {
            id: generateUUID(),
            ...newUser
        };

        await userStore.setJSON(userKey, createdUser);

        // Send welcome email using Resend
        if (process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    // from: 'onboarding@resend.dev',
                    from: 'info@web-developer.one',
                    to: createdUser.email,
                    subject: 'Welcome to CryptoDx!',
                    html: `<h1>Welcome, ${createdUser.username}!</h1><p>Your account for CryptoDx has been successfully created. You can now log in and start exploring.</p><p>Thanks for joining!</p>`,
                });
            } catch (emailError) {
                // Log the error but don't fail the registration if email fails
                console.error("Failed to send welcome email:", emailError);
            }
        } else {
            console.warn("RESEND_API_KEY is not set. Skipping welcome email.");
        }


        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = createdUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}

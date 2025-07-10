
'use server';

import { getStore } from '@netlify/blobs';
import type { User } from '@/lib/types';

// This function is intended to be used by server-side code only.
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
        id: simpleUUID(),
        ...userData
    };

    await userStore.setJSON(userKey, userToStore);
    return userToStore;
}

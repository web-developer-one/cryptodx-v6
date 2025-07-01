import Image from 'next/image';
import { cn } from '@/lib/utils';
import React from 'react';

export const SiteLogo = ({ className }: { className?: string }) => (
    <Image
        src="/Cdx-box-icon-none.png"
        alt="CryptoDx Logo"
        width={64}
        height={64}
        className={cn("h-6 w-6", className)}
    />
);

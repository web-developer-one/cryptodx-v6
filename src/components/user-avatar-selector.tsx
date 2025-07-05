
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// --- SVG Avatar Components ---

const Avatar1 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}><rect width="100" height="100" rx="20" fill="hsl(var(--primary))" /><text x="50" y="55" dominantBaseline="middle" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="60" fontFamily="sans-serif" fontWeight="bold">B</text></svg>
);

const Avatar2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}><rect width="100" height="100" rx="20" fill="#627EEA" /><path d="M50 10 L85 45 L50 60 L15 45 Z" fill="#fff" fillOpacity="0.7" /><path d="M50 65 L85 50 L50 90 L15 50 Z" fill="#fff" /></svg>
);

const Avatar3 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}><rect width="100" height="100" rx="20" fill="hsl(var(--accent))" /><path d="M72 50L28 50 M50 28L50 72" stroke="hsl(var(--accent-foreground))" strokeWidth="8" strokeLinecap="round" /></svg>
);

const Avatar4 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(0, -2.5)"><rect width="100" height="100" rx="20" fill="#2c2c2c" /><path d="M35,65 C40,80 60,80 65,65" stroke="white" strokeWidth="5" fill="none" /><circle cx="40" cy="50" r="5" fill="white" /><circle cx="60" cy="50" r="5" fill="white" /></g></svg>
);

const Avatar5 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}><rect width="100" height="100" rx="20" fill="#f7931a" /><text x="50" y="55" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="60" fontFamily="monospace" fontWeight="bold">₿</text></svg>
);

// --- Avatar Data ---

export const avatars = [
  { id: 'avatar1', name: 'Block', component: <Avatar1 />, src: '/avatars/avatar1.svg' },
  { id: 'avatar2', name: 'Ether', component: <Avatar2 />, src: '/avatars/avatar2.svg' },
  { id: 'avatar3', name: 'Plus', component: <Avatar3 />, src: '/avatars/avatar3.svg' },
  { id: 'avatar4', name: 'Robot', component: <Avatar4 />, src: '/avatars/avatar4.svg' },
  { id: 'avatar5', name: 'Satoshi', component: <Avatar5 />, src: '/avatars/avatar5.svg' },
];

export const getAvatarById = (id: string) => {
  return avatars.find(a => a.id === id) || avatars[0];
};

// --- Main Component ---

interface UserAvatarSelectorProps {
  currentAvatar: string;
  onSelectAvatar: (id: string) => void;
}

export function UserAvatarSelector({ currentAvatar, onSelectAvatar }: UserAvatarSelectorProps) {
  return (
    <TooltipProvider>
        <div className="flex items-center gap-4">
        {avatars.map((avatar) => (
            <Tooltip key={avatar.id}>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={() => onSelectAvatar(avatar.id)}
                        className={cn(
                            'relative h-16 w-16 rounded-full transition-all duration-200',
                            currentAvatar === avatar.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                        )}
                    >
                        {avatar.component}
                        {currentAvatar === avatar.id && (
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{avatar.name}</p>
                </TooltipContent>
            </Tooltip>
        ))}
        </div>
    </TooltipProvider>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

// --- Avatar Data ---

export const avatars = [
  {
    id: 'avatar1',
    name: 'Block',
    src: 'https://placehold.co/64x64.png',
    hint: 'block letter',
  },
  {
    id: 'avatar2',
    name: 'Ether',
    src: 'https://placehold.co/64x64.png',
    hint: 'ethereum logo',
  },
  {
    id: 'avatar3',
    name: 'Plus',
    src: 'https://placehold.co/64x64.png',
    hint: 'plus sign',
  },
  {
    id: 'avatar4',
    name: 'Admin',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat1&accessoriesType=Prescription01&hatColor=Red&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=Blue03&eyeType=Squint&eyebrowType=AngryNatural&mouthType=Smile&skinColor=Black',
    hint: 'robot head',
    unoptimized: true,
  },
  {
    id: 'avatar5',
    name: 'Satoshi',
    src: 'https://placehold.co/64x64.png',
    hint: 'bitcoin logo',
  },
];

export const getAvatarById = (id: string) => {
  return avatars.find((a) => a.id === id) || avatars[0];
};

// --- Main Component ---

interface UserAvatarSelectorProps {
  currentAvatar: string;
  onSelectAvatar: (id: string) => void;
}

export function UserAvatarSelector({
  currentAvatar,
  onSelectAvatar,
}: UserAvatarSelectorProps) {
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
                  'relative h-16 w-16 rounded-full transition-all duration-200 overflow-hidden',
                  currentAvatar === avatar.id
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'hover:scale-105'
                )}
              >
                <Image
                  src={avatar.src}
                  alt={avatar.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  data-ai-hint={avatar.hint}
                  unoptimized={(avatar as any).unoptimized}
                />
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

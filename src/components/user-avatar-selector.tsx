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
import { useAuth } from '@/hooks/use-auth';

// --- Avatar Data ---

export const avatars = [
  {
    id: 'Admin',
    name: 'Block',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat1&accessoriesType=Prescription01&hatColor=Red&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=Blue03&eyeType=Squint&eyebrowType=AngryNatural&mouthType=Smile&skinColor=Black',
    hint: 'block letter',
    unoptimized: true,
  },
  {
    id: 'avatar2',
    name: 'HimOne',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat1&accessoriesType=Prescription01&hatColor=Red&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=Blue03&eyeType=Squint&eyebrowType=AngryNatural&mouthType=Smile&skinColor=Black',
    hint: 'Male',
  },
  {
    id: 'avatar3',
    name: 'HerTwo',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraightStrand&accessoriesType=Kurt&hairColor=Auburn&facialHairType=Blank&facialHairColor=BlondeGolden&clotheType=Overall&clotheColor=Blue01&eyeType=Surprised&eyebrowType=Default&mouthType=Default&skinColor=Yellow',
    hint: 'Female',
  },
  {
    id: 'avatar4',
    name: 'BitCoin',
    src: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=040',
    hint: 'robot head',
    unoptimized: true,
  },
  {
    id: 'avatar5',
    name: 'Ethereum',
    src: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040',
    hint: 'bitcoin logo',
    unoptimized: true,
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
  const { user } = useAuth();

  // Filter avatars based on user's admin status
  const selectableAvatars = user?.isAdmin
    ? avatars
    : avatars.filter((avatar) => avatar.id !== 'Admin');

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {selectableAvatars.map((avatar) => (
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

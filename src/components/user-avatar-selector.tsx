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
    name: 'Admin',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairFro&accessoriesType=Sunglasses&hairColor=BrownDark&facialHairType=BeardMajestic&facialHairColor=BrownDark&clotheType=ShirtVNeck&clotheColor=PastelBlue&eyeType=EyeRoll&eyebrowType=SadConcerned&mouthType=Disbelief&skinColor=DarkBrown',
    hint: 'block letter',
    unoptimized: true,
  },
  {
    id: 'avatar2',
    name: 'Male',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Wayfarers&hatColor=Blue02&facialHairType=Blank&clotheType=Hoodie&clotheColor=Gray02&eyeType=Close&eyebrowType=SadConcernedNatural&mouthType=Default&skinColor=Light',
    hint: 'Male',
  },
  {
    id: 'avatar3',
    name: 'Female',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairShavedSides&accessoriesType=Kurt&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=WinkWacky&eyebrowType=Angry&mouthType=ScreamOpen&skinColor=Pale',
    hint: 'Female',
  },
  {
    id: 'avatar4',
    name: 'BitCoin',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairBob&accessoriesType=Sunglasses&hairColor=Black&facialHairType=Blank&facialHairColor=BrownDark&clotheType=ShirtCrewNeck&clotheColor=Blue03&graphicType=Diamond&eyeType=Default&eyebrowType=FlatNatural&mouthType=Smile&skinColor=Brown',
    hint: 'bitcoin logo',
    unoptimized: true,
  },
  {
    id: 'avatar5',
    name: 'Ethereum',
    src: 'https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Sunglasses&facialHairType=BeardMedium&facialHairColor=Red&clotheType=BlazerShirt&eyeType=Dizzy&eyebrowType=UpDown&mouthType=Concerned&skinColor=Tanned',
    hint: 'ethereum logo',
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

'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function OldChangellyPage() {
  useEffect(() => {
    redirect('/changellyswap');
  }, []);

  return null;
}

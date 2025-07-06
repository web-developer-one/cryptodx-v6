
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export function LiveUpdateNotifier() {
  const { toast } = useToast();

  useEffect(() => {
    const showUpdateToast = () => {
      toast({
        description: (
             <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Bell className="h-5 w-5" />
                        <span>Live Update</span>
                    </div>
                    <Badge variant="warning">Important</Badge>
                </div>
                <p className="text-sm opacity-90 font-normal">
                    Market data has been automatically refreshed.
                </p>
            </div>
        )
      });
    };

    // Show an initial toast shortly after the app loads
    const initialTimeoutId = setTimeout(showUpdateToast, 10000); // 10 seconds after load

    // Set up the recurring toast
    const intervalId = setInterval(showUpdateToast, 15 * 60 * 1000); // Every 15 minutes

    // Cleanup function to clear the timeout and interval
    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  }, [toast]);

  return null; // This component does not render anything itself
}

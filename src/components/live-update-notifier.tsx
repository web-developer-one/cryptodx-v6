
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export function LiveUpdateNotifier() {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const showUpdateToast = async () => {
      // Prevent multiple fetches at the same time
      if (isFetching) return;
      setIsFetching(true);

      try {
        const response = await fetch('/api/live-update');
        if (!response.ok) {
          // Don't show toast if the API fails, just log it.
          console.error("Failed to fetch live update.");
          return;
        }

        const data = await response.json();
        
        if (data.update) {
            toast({
                title: (
                  <div className="flex items-center justify-between w-full">
                    <span>Live Update</span>
                    <Badge>New</Badge>
                  </div>
                ),
                description: (
                  <div className="w-full pt-2 flex items-start gap-3">
                    <Bell className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground leading-tight">
                        {data.update}
                    </p>
                  </div>
                ),
                duration: 8000, // Show for 8 seconds
            });
        }
      } catch (error) {
        console.error("Error fetching or showing update toast:", error);
      } finally {
        setIsFetching(false);
      }
    };

    // Set up the recurring toast every 15 minutes.
    const intervalId = setInterval(showUpdateToast, 15 * 60 * 1000);

    // Cleanup function to clear the interval
    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isFetching should not be in dependency array to avoid re-running setInterval

  return null; // This component does not render anything itself
}

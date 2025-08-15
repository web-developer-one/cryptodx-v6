
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';

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
        
        if (data.update && data.sourceUrl && data.sourceName) {
            toast({
                title: "Live Update",
                description: (
                  <div className="flex flex-col gap-3">
                      <div className="w-full pt-2 flex items-start gap-3">
                          <Bell className="h-5 w-5 flex-shrink-0 text-primary" />
                          <p className="flex-1 text-sm text-muted-foreground leading-tight">
                              {data.update}
                          </p>
                          <Badge>New</Badge>
                      </div>
                      <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="self-start -ml-1">
                          <Button variant="link" size="sm" className="p-1 h-auto text-xs">
                              Read more at {data.sourceName}
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Button>
                      </a>
                  </div>
                ),
                duration: 8000,
            });
        }
      } catch (error) {
        console.error("Error fetching or showing update toast:", error);
      } finally {
        setIsFetching(false);
      }
    };

    // Run once on component mount
    showUpdateToast();
    
    // Set up the recurring toast every 15 minutes.
    const intervalId = setInterval(showUpdateToast, 15 * 60 * 1000);

    // Cleanup function to clear the interval
    return () => {
      clearInterval(intervalId);
    };
  }, [toast]); // isFetching is managed internally, so it doesn't need to be in the dependency array.

  return null; // This component does not render anything itself
}

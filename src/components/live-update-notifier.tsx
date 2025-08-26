
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '@/hooks/use-user';

export function LiveUpdateNotifier() {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const { user, isAuthenticated } = useUser();

  // Check if the user has access to this feature.
  const hasAccess = isAuthenticated && user && ['Advanced', 'Administrator'].includes(user.pricePlan);

  const showUpdateToast = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const response = await fetch('/api/live-update');
      if (!response.ok) {
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
  }, [isFetching, toast]);

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    // Run once immediately on component mount when access is granted
    showUpdateToast();
    
    // Set up the recurring toast every 15 minutes.
    const intervalId = setInterval(showUpdateToast, 15 * 60 * 1000);

    // Cleanup function to clear the interval when the component unmounts or access changes
    return () => {
      clearInterval(intervalId);
    };
  }, [hasAccess, showUpdateToast]); // Re-run effect if access status changes

  return null; // This component does not render anything itself
}

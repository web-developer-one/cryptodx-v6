
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LiveUpdateNotifier() {
  const { toast } = useToast();

  useEffect(() => {
    const showUpdateToast = () => {
      toast({
        title: (
          <div className="flex items-center justify-between w-full">
            <span>Live Update</span>
            <Badge variant="warning">Important</Badge>
          </div>
        ),
        description: (
          <div className="w-full pt-2 flex flex-col gap-4">
            <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 flex-shrink-0 text-warning" />
                <p className="text-sm text-muted-foreground leading-tight">
                    Market data has been automatically refreshed.
                </p>
            </div>
            <a href="https://coinmarketcap.com" target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" className="w-full">
                  View Data Source
                  <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        ),
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

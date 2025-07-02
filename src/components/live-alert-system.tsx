'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkForAlerts } from '@/ai/flows/live-alert';
import { Megaphone } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';

// This component is a background service and does not render any UI itself.
export function LiveAlertSystem() {
  const { toast } = useToast();
  const lastAlertMessage = useRef('');
  const isChecking = useRef(false);

  useEffect(() => {
    const check = async () => {
      // Prevent multiple checks from running simultaneously
      if (isChecking.current) {
        return;
      }
      isChecking.current = true;

      try {
        const result = await checkForAlerts();
        
        // Only show a toast if there is a new, different alert
        if (result.hasAlert && result.message && result.message !== lastAlertMessage.current) {
          lastAlertMessage.current = result.message;
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <span>{result.title}</span>
              </div>
            ),
            description: result.message,
            duration: 10000, // Show for 10 seconds
            action: result.sourceUrl ? (
                <ToastAction
                  altText="View Source"
                  onClick={() => window.open(result.sourceUrl, '_blank', 'noopener,noreferrer')}
                >
                  View Source
                </ToastAction>
            ) : undefined,
          });
        }
      } catch (error) {
        console.error('Error checking for live alerts:', error);
      } finally {
        isChecking.current = false;
      }
    };

    // Check for alerts every 15 minutes.
    const intervalId = setInterval(check, 900000); 

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [toast]);

  return null; // This component does not render anything
}

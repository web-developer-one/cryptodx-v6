'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkForAlerts } from '@/ai/flows/live-alert';
import { Megaphone } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';

// This component is a background service and does not render any UI itself.
export function LiveAlertSystem() {
  const { toast } = useToast();
  const [lastAlertMessage, setLastAlertMessage] = useState('');
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
        if (result.hasAlert && result.message && result.message !== lastAlertMessage) {
          setLastAlertMessage(result.message);
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

    // Check for alerts immediately on mount, then set an interval
    check();
    const intervalId = setInterval(check, 900000); // Check every 15 minutes

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [toast, lastAlertMessage]);

  return null; // This component does not render anything
}


'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { checkTokenReputation, CheckTokenReputationOutput } from '@/ai/flows/check-token-reputation';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { translateTexts } from '@/ai/flows/translate-text';
import { languages } from '@/lib/i18n';

export function ReputationAlert({ token }: { token: TokenDetails }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [reputation, setReputation] = useState<CheckTokenReputationOutput | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const getReputation = async () => {
      setIsLoading(true);
      try {
        const result = await checkTokenReputation({
          tokenName: token.name,
          tokenSymbol: token.symbol,
        });
        setReputation(result);

        if (result.isScamOrScandal && (user?.isAdmin || user?.pricingPlan === 'Advanced')) {
          let textToSpeak = result.reasoning;
          const targetLangInfo = languages.find(l => l.code === language);
          if (language !== 'en' && targetLangInfo) {
              try {
                  const translationResult = await translateTexts({
                      texts: { alert: result.reasoning },
                      targetLanguage: targetLangInfo.englishName,
                  });
                  if (translationResult.translations?.alert) {
                      textToSpeak = translationResult.translations.alert;
                  }
              } catch (e) { console.error("Could not translate alert audio", e); }
          }

          try {
              const audioResult = await textToSpeech(textToSpeak);
              if (audioRef.current && audioResult.media) {
                  audioRef.current.src = audioResult.media;
                  audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
              }
          } catch (e) { console.error("Could not generate alert audio", e); }
        }

      } catch (error) {
        console.error("Failed to check token reputation:", error);
        // Don't show an error to the user, just fail silently.
        setReputation(null);
      } finally {
        setIsLoading(false);
      }
    };

    getReputation();
  }, [token.name, token.symbol, user?.isAdmin, user?.pricingPlan, language]);


  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           <div>
              <p className="font-semibold">{t('ReputationAlert.checking')}</p>
              <p className="text-sm text-muted-foreground">{t('ReputationAlert.checkingDescription')}</p>
           </div>
        </CardContent>
      </Card>
    )
  }

  if (!reputation) return null;

  // Show a "Verified" card if no scam is detected.
  if (!reputation.isScamOrScandal) {
      return (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">{t('ReputationAlert.clear')}</p>
              <p className="text-sm text-muted-foreground">{t('ReputationAlert.clearDescription')}</p>
            </div>
          </CardContent>
        </Card>
      );
  }

  return (
    <>
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <span>{t('ReputationAlert.alertTitle').replace('{tokenName}', token.name).replace('{tokenSymbol}', token.symbol)}</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="pt-4 text-base space-y-4">
                  <p>{reputation.reasoning}</p>
                  {reputation.sourceUrl && (
                      <p className="text-sm">
                          {t('ReputationAlert.source')}: <a href={reputation.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 break-all">{reputation.sourceUrl}</a>
                      </p>
                  )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t('BuyInterface.acknowledgeAndContinue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <audio ref={audioRef} className="hidden" />
    </>
  );
}

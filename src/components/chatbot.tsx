
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { askChatbot } from '@/ai/flows/chatbot-flow';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
  audio?: string;
};

export function Chatbot() {
  const { user } = useAuth();
  const { t, language: siteLanguage } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'bot',
      text: t('Chatbot.initialMessage'),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const canUseAdvancedFeatures = user && (user.pricingPlan === 'Advanced' || user.isAdmin);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askChatbot({
        message: input,
        language: siteLanguage,
        enableAudio: canUseAdvancedFeatures,
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: result.response,
        audio: result.audio,
      };
      setMessages((prev) => [...prev, botMessage]);

      if (result.audio && audioRef.current) {
        audioRef.current.src = result.audio;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }

    } catch (error) {
      console.warn('Chatbot error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: t('Chatbot.errorResponse'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (audioDataUri: string) => {
    if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }

  if (!user) {
    return null; // Don't show the chatbot if the user is not logged in.
  }
  
  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <audio ref={audioRef} className="hidden" />
        {isOpen ? (
          <Card className="w-96 h-[600px] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                <span>{t('Chatbot.title')}</span>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
              <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex items-end gap-2',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.text.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                      </div>
                      {message.role === 'bot' && message.audio && (
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePlayAudio(message.audio!)}>
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Play audio response</p>
                            </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                         <div className="flex items-center gap-2 max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <div className="w-full flex items-center gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t('Chatbot.placeholder')}
                  className="min-h-[40px] max-h-24"
                  rows={1}
                />
                <Button onClick={handleSend} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Button
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg"
            onClick={() => setIsOpen(true)}
          >
            <Bot className="h-8 w-8" />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}

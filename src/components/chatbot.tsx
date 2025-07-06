
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Loader2, X, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SiteLogo } from './site-logo';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessagePart {
  text: string;
}

interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
  audioSrc?: string;
  isAudioLoading?: boolean;
}

const LinkifiedText = ({ text }: { text: string }) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%?=~_|])/ig;
  if (!text) return null;

  const parts = text.split(urlRegex);

  return (
    <>
      {parts
        .filter(part => part) // Filter out empty strings from split
        .map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              href={part}
              key={i}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

export function Chatbot() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          parts: [{ text: t('Chatbot.initialMessage') }],
        },
      ]);
    }
  }, [isOpen, t, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const playAudio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  const fetchAndPlayTTS = useCallback(async (text: string, messageIndex: number) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to fetch audio.');
      
      const { audioDataUri } = await response.json();

      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[messageIndex]) {
            newMessages[messageIndex].audioSrc = audioDataUri;
            newMessages[messageIndex].isAudioLoading = false;
        }
        return newMessages;
      });

      playAudio(audioDataUri);

    } catch (error) {
      console.error("TTS Error:", error);
       setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[messageIndex]) {
            newMessages[messageIndex].isAudioLoading = false;
        }
        return newMessages;
      });
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    const currentInput = input;
    setInput('');
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [...messages, userMessage], message: currentInput, language }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const serverError = errorData?.error || t('Chatbot.errorResponse');
        throw new Error(serverError);
      }

      const data = await response.json();
      const modelMessage: Message = {
        role: 'model',
        parts: [{ text: data.response }],
        isAudioLoading: true,
      };
      
      const messageIndex = messages.length + 1;
      setMessages(prev => [...prev, modelMessage]);
      fetchAndPlayTTS(data.response, messageIndex);

    } catch (error: any) {
      const errorMessage: Message = {
        role: 'model',
        parts: [{ text: error.message || t('Chatbot.connectionError') }],
      };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, language, t, fetchAndPlayTTS]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
          <span className="sr-only">Toggle Chatbot</span>
        </Button>
      </div>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] flex flex-col shadow-2xl rounded-lg">
           <CardHeader className="p-4 border-b">
             <div className="flex items-center gap-2">
                <SiteLogo className="h-6 w-6" />
                <h2 className="text-lg font-semibold leading-none tracking-tight">{t('Chatbot.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground pt-1">
                {t('Chatbot.askAbout')}{' '}
                <span className="font-semibold text-primary">{t('Chatbot.topics')}</span>
            </p>
          </CardHeader>

          <ScrollArea className="flex-1 bg-background" ref={scrollAreaRef}>
            <CardContent className="p-4 space-y-6">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'model' && (
                          <div className='flex flex-col gap-1 self-start'>
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback>
                                    <Bot className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        disabled={!message.audioSrc || message.isAudioLoading}
                                        onClick={() => message.audioSrc && playAudio(message.audioSrc)}
                                    >
                                        {message.isAudioLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Volume2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('Chatbot.playAudioTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                        <div
                          className={cn(
                            'p-3 rounded-lg max-w-[240px] whitespace-pre-wrap break-words',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <LinkifiedText text={message.parts[0].text} />
                        </div>
                        {message.role === 'user' && (
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback>
                                <Bot className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                         <div className="p-3 rounded-lg bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                         </div>
                    </div>
                )}
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="p-4 border-t bg-background">
            <div className="relative w-full flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('Chatbot.placeholder')}
                className="pr-12"
                disabled={isLoading}
              />
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">{t('Chatbot.send')}</span>
                  </Button>
               </div>
            </div>
          </CardFooter>
          <audio ref={audioRef} className="hidden" />
        </Card>
      )}
    </TooltipProvider>
  );
}

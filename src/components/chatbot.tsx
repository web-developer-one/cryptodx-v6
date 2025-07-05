
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, User, Volume2, VolumeX, Mic, MicOff, Languages, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { cryptoChat } from '@/ai/flows/chatbot';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SiteLogo } from './site-logo';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { languages } from '@/lib/i18n';


type Message = {
    role: 'user' | 'model';
    content: string;
};

const renderMessageContent = (content: string, setIsOpen: (open: boolean) => void) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  const result: (string | JSX.Element)[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      result.push(content.substring(lastIndex, match.index));
    }

    const [fullMatch, text, href] = match;

    if (href.startsWith('/')) {
      result.push(
        <Link
          key={lastIndex}
          href={href}
          className="text-primary underline hover:text-primary/80 break-all"
          onClick={() => setIsOpen(false)}
        >
          {text}
        </Link>
      );
    } else {
      result.push(
        <a key={lastIndex} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 break-all">
          {text}
        </a>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    result.push(content.substring(lastIndex));
  }

  return result.length > 0 ? <>{result}</> : <>{content}</>;
};

export function Chatbot() {
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: t('Chatbot.initialMessage') }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [botLanguage, setBotLanguage] = useState(language);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Keep bot language in sync with site language unless user is admin or advanced
        if (!user?.isAdmin && user?.pricingPlan !== 'Advanced') {
            setBotLanguage(language);
        }
    }, [language, user?.isAdmin, user?.pricingPlan]);

    useEffect(() => {
        const savedPreference = localStorage.getItem('chatbot_audio_enabled');
        if (savedPreference !== null) {
            setIsAudioEnabled(JSON.parse(savedPreference));
        }
    }, []);

    const toggleAudio = () => {
        const newPreference = !isAudioEnabled;
        setIsAudioEnabled(newPreference);
        localStorage.setItem('chatbot_audio_enabled', JSON.stringify(newPreference));
        if (!newPreference && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };


    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const isPremium = user?.isAdmin || user?.pricingPlan === 'Advanced';

            const result = await cryptoChat({ 
                history: chatHistory, 
                userMessage: userMessage.content,
                targetLanguage: isPremium ? languages.find(l => l.code === botLanguage)?.englishName : undefined,
                isFreePlan: !user || user.pricingPlan === 'Free'
            });
            
            const responseText = result.response?.trim();
            if (responseText) {
                const modelMessage: Message = { role: 'model', content: responseText };
                setMessages(prev => [...prev, modelMessage]);

                if (isAudioEnabled && isPremium) {
                    try {
                        const audioResult = await textToSpeech(responseText);
                        if (audioRef.current && audioResult.media) {
                            audioRef.current.src = audioResult.media;
                            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
                        }
                    } catch (audioError) {
                        console.error("Error generating audio:", audioError);
                    }
                }

            } else {
                 const errorMessage: Message = { role: 'model', content: t('Chatbot.errorResponse') };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Error calling chatbot flow:", error);
            const errorMessage: Message = { role: 'model', content: t('Chatbot.connectionError') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast({ variant: "destructive", title: "Error", description: t('Chatbot.micNotSupported') });
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = recorder;
                audioChunksRef.current = [];

                recorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        if (!base64data || base64data === 'data:') return;

                        setIsTranscribing(true);
                        try {
                            const result = await speechToText({ audioDataUri: base64data });
                            setInputValue(result.transcript);
                        } catch (error) {
                            console.error('Transcription failed:', error);
                            toast({ variant: "destructive", title: "Error", description: t('Chatbot.transcriptionFailed') });
                        } finally {
                            setIsTranscribing(false);
                        }
                    };

                    stream.getTracks().forEach(track => track.stop());
                };

                recorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Microphone access denied:', error);
                toast({ variant: "destructive", title: "Permission Denied", description: t('Chatbot.micPermissionDenied') });
            }
        }
    };


    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                {!isOpen && (
                    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2 animate-in fade-in-50 slide-in-from-bottom-2">
                        <div className="w-full max-w-[220px] rounded-lg bg-secondary p-3 text-sm text-secondary-foreground shadow-lg text-right">
                            {t('Chatbot.askMeAbout')}
                        </div>
                        <div className="relative w-full max-w-[220px] rounded-lg bg-secondary p-3 text-sm text-secondary-foreground shadow-lg text-right">
                            {t('Chatbot.topics')}
                            <div className="absolute right-6 -bottom-2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-secondary" />
                        </div>
                    </div>
                )}
                <PopoverTrigger asChild>
                    <Button
                        variant="primary"
                        size="icon"
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Bot className="h-7 w-7" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    side="top"
                    align="end"
                    className="w-[90vw] max-w-sm rounded-lg p-0 border-0 shadow-2xl"
                    sideOffset={10}
                >
                    <Card className="flex flex-col h-[60vh] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                            <CardTitle className="text-lg">{t('Chatbot.title')}</CardTitle>
                            <div className='flex items-center gap-1'>
                                {(user?.isAdmin || user?.pricingPlan === 'Advanced') && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Languages className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <ScrollArea className="h-72">
                                                {languages.map((lang) => (
                                                    <DropdownMenuItem key={lang.code} onSelect={() => setBotLanguage(lang.code)}>
                                                        <Check className={`mr-2 h-4 w-4 ${botLanguage === lang.code ? "opacity-100" : "opacity-0"}`} />
                                                        {lang.displayName}
                                                    </DropdownMenuItem>
                                                ))}
                                            </ScrollArea>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <Button variant="ghost" size="icon" onClick={toggleAudio} className="h-6 w-6">
                                    {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                                    <span className="sr-only">{isAudioEnabled ? "Disable Audio" : "Enable Audio"}</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            <ScrollArea className="h-full" ref={scrollAreaRef as any}>
                                <div className="p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                                        {message.role === 'model' && (
                                            <Avatar className="h-8 w-8 border">
                                                <div className="bg-primary h-full w-full flex items-center justify-center p-1">
                                                    <SiteLogo className="h-full w-full" />
                                                </div>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-[80%] rounded-lg px-3 py-2 text-sm break-words",
                                            message.role === 'user' 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'bg-muted'
                                        )}>
                                            <p className="whitespace-pre-wrap break-all">
                                              {message.role === 'model' ? renderMessageContent(message.content, setIsOpen) : message.content}
                                            </p>
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="h-8 w-8 border">
                                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border">
                                            <div className="bg-primary h-full w-full flex items-center justify-center p-1">
                                                <SiteLogo className="h-full w-full" />
                                            </div>
                                        </Avatar>
                                        <div className="bg-muted rounded-lg px-3 py-2 flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="p-4 border-t">
                            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                                <Input
                                    id="message"
                                    placeholder={t('Chatbot.placeholder')}
                                    className="flex-1 text-sm"
                                    autoComplete="off"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isLoading || isRecording || isTranscribing}
                                />
                                <Button type="button" size="icon" onClick={handleMicClick} disabled={isLoading}>
                                    {isTranscribing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isRecording ? (
                                        <MicOff className="h-4 w-4 text-destructive" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">{isRecording ? t('Chatbot.stopRecording') : t('Chatbot.recordMessage')}</span>
                                </Button>
                                <Button type="submit" size="icon" disabled={isLoading || isRecording || isTranscribing}>
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">{t('Chatbot.send')}</span>
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </PopoverContent>
            </Popover>
            <audio ref={audioRef} className="hidden" />
        </>
    );
}

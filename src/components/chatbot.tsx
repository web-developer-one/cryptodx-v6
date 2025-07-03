'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, User } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { cryptoChat } from '@/ai/flows/chatbot';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SiteLogo } from './site-logo';
import { cn } from '@/lib/utils';


type Message = {
    role: 'user' | 'model';
    content: string;
};

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I'm the 'CryptoDx' Chatbot. How can I help you today on all things Blockchain, DeFi, Crypto, NFTs, or AI?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

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
        if (!inputValue.trim()) return;

        const userMessage: Message = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const result = await cryptoChat({ history: chatHistory, userMessage: userMessage.content });
            const modelMessage: Message = { role: 'model', content: result.response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error calling chatbot flow:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            {!isOpen && (
                <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="w-full max-w-[220px] rounded-lg bg-secondary p-3 text-sm text-secondary-foreground shadow-lg text-right">
                        Ask me about...
                    </div>
                    <div className="relative w-full max-w-[220px] rounded-lg bg-secondary p-3 text-sm text-secondary-foreground shadow-lg text-right">
                        Blockchain, DeFi, Crypto, NFT, or AI!
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
                        <CardTitle className="text-lg">CryptoDx Chatbot</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                            <X className="h-4 w-4" />
                        </Button>
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
                                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                        message.role === 'user' 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'bg-muted'
                                    )}>
                                        {message.content}
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
                                placeholder="Type your message..."
                                className="flex-1 text-sm"
                                autoComplete="off"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

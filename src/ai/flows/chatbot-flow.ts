
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatbotInputSchema = z.object({
  message: z.string().describe("The user's message to the chatbot."),
  language: z.string().describe('The language for the response (e.g., "English", "Spanish").'),
  enableAudio: z.boolean().describe('Whether to generate an audio response.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's text response."),
  audio: z.string().optional().describe('The audio response as a base64-encoded WAV data URI.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  // This is a fallback implementation because the AI package is failing to install.
  // It returns a static error message to the user.
  console.error("Chatbot disabled due to configuration issue.");
  return {
    response: "I'm sorry, the chatbot is currently unavailable due to a configuration issue. Please try again later.",
  };
}


'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This file has been modified to gracefully handle the absence of Genkit AI packages,
// which are causing installation errors in the current environment.

// Helper to create a WAV file from raw PCM data. This avoids external dependencies.
function pcmToWav(pcmData: Buffer): string {
  const numChannels = 1;
  const sampleRate = 24000;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Sub-chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // Bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([buffer, pcmData]);
  return 'data:audio/wav;base64,' + wavBuffer.toString('base64');
}

const ChatbotInputSchema = z.object({
  message: z.string().describe("The user's message to the chatbot."),
  language: z
    .string()
    .describe('The language for the response (e.g., "English", "Spanish").'),
  enableAudio: z.boolean().describe('Whether to generate an audio response.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's text response."),
  audio: z
    .string()
    .optional()
    .describe('The audio response as a base64-encoded WAV data URI.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  // AI features are disabled due to a persistent package installation issue.
  // Return a static error message to the user.
  console.warn("askChatbot was called, but AI features are disabled.");
  return {
    response:
      "I'm sorry, the chatbot is currently unavailable due to a configuration issue. Please try again later.",
    audio: undefined,
  };
}


// The original flow definition is left below for when the package issue can be resolved.
const chatbotPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {
    schema: z.object({
      message: z.string(),
      language: z.string(),
    }),
  },
  prompt: `You are a helpful and friendly chatbot for a decentralized crypto exchange named CryptoDx.
  Your goal is to answer user questions about blockchain, DeFi, crypto, NFTs, or AI in a clear and concise way.
  
  IMPORTANT: Respond in the following language: {{{language}}}.
  
  User's question:
  "{{{message}}}"
  `,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input: ChatbotInput) => {
    // This code path is not executed because askChatbot is intercepted.
    return {
      response:
        "I'm sorry, the chatbot is currently unavailable due to a configuration issue. Please try again later.",
      audio: undefined,
    };
  }
);

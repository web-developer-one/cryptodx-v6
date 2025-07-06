
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
  // This function provides simple, keyword-based responses as a fallback.
  console.warn("askChatbot was called, but AI features are disabled. Using fallback responses.");

  const message = input.message.toLowerCase();

  if (message.includes('hello') || message.includes('hi')) {
    return {
      response: "Hello! How can I help you with your crypto questions today? I can answer basic questions about Bitcoin, Ethereum, and NFTs.",
    };
  }
  if (message.includes('bitcoin')) {
    return {
      response:
        'Bitcoin is the first decentralized cryptocurrency. It was created in 2009 by an unknown person or group of people using the name Satoshi Nakamoto. It operates on a proof-of-work blockchain.',
    };
  }
  if (message.includes('ethereum')) {
    return {
      response:
        'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform. It is transitioning from proof-of-work to proof-of-stake.',
    };
  }
  if (message.includes('nft')) {
    return {
        response: "A Non-Fungible Token (NFT) is a unique digital asset that represents ownership of real-world items like art, music, in-game items, and videos. They are bought and sold online, frequently with cryptocurrency, and they are generally encoded with the same underlying software as many cryptos."
    }
  }
  if (message.includes('what can you do') || message.includes('help')) {
    return {
        response: "Right now, my advanced AI capabilities are offline due to a configuration issue. I can provide some basic information about Bitcoin, Ethereum, and NFTs. Please try asking me about one of those topics."
    }
  }

  return {
    response:
      "I'm sorry, I can only answer very basic questions about Bitcoin, Ethereum, or NFTs right now. My advanced AI features are temporarily disabled.",
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

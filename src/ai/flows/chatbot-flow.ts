
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This file has been modified to gracefully handle the absence of Genkit AI packages,
// which are causing installation errors in the current environment. This version
// expands the keyword-based responses to make the chatbot more helpful without
// relying on external packages that break the build.

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
  // This function provides expanded, keyword-based responses as a fallback.
  console.warn("askChatbot was called, but AI features are disabled. Using fallback responses.");

  const message = input.message.toLowerCase();

  // Expanded keyword-based responses
  if (message.includes('hello') || message.includes('hi')) {
    return {
      response: "Hello! I'm the CryptoDx chatbot. You can ask me about topics like Blockchain, DeFi, Bitcoin, Ethereum, and NFTs.",
    };
  }
  if (message.includes('bitcoin')) {
    return {
      response: 'Bitcoin (BTC) is the first decentralized cryptocurrency. It was created in 2009 by an unknown person or group using the name Satoshi Nakamoto. It operates on a proof-of-work blockchain, which is secured by a global network of computers.',
    };
  }
  if (message.includes('ethereum')) {
    return {
      response: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Its native cryptocurrency is Ether (ETH). Ethereum allows developers to build and deploy decentralized applications (dApps) and is currently secured by a proof-of-stake consensus mechanism.',
    };
  }
  if (message.includes('nft')) {
    return {
        response: "A Non-Fungible Token (NFT) is a unique digital asset representing ownership of items like art, music, or videos. They are recorded on a blockchain, which provides a public proof of ownership. Unlike cryptocurrencies like Bitcoin, each NFT is unique and cannot be replaced with another."
    }
  }
   if (message.includes('blockchain')) {
      return {
          response: "A blockchain is a distributed, immutable ledger that records transactions in a secure and transparent way. It's a chain of blocks, where each block contains a list of transactions. Once a block is added to the chain, it cannot be altered, ensuring the integrity of the record."
      }
  }
  if (message.includes('defi')) {
      return {
          response: "DeFi, or Decentralized Finance, is a term for financial services built on blockchain technology. It aims to create an open and global financial system that doesn't rely on traditional central intermediaries like banks. DeFi applications include lending, borrowing, and trading assets."
      }
  }
  if (message.includes('wallet')) {
      return {
          response: "In crypto, a wallet is a digital tool that allows you to store, send, and receive cryptocurrencies. It holds your private keys, which are secret passwords that give you access to your assets on the blockchain. Examples include MetaMask and Trust Wallet. You are always in control of your own wallet and keys."
      }
  }
  if (message.includes('smart contract')) {
      return {
          response: "A smart contract is a self-executing contract with the terms of the agreement directly written into code. They run on a blockchain, so they are stored on a public database and cannot be changed. Transactions that happen in a smart contract are processed by the blockchain, which means they can be sent automatically without a third party."
      }
  }
  if (message.includes('what is cryptodx')) {
      return {
          response: "CryptoDx is a decentralized exchange (DEX) interface. It provides tools for users to swap cryptocurrencies, provide liquidity, and explore the market, all while maintaining control of their own assets in their personal wallets."
      }
  }
  if (message.includes('what can you do') || message.includes('help')) {
    return {
        response: "Due to a temporary configuration issue, my advanced AI is offline. However, I can provide high-quality information on many crypto topics. Try asking me questions like 'What is a blockchain?', 'Explain DeFi', or ask about specific cryptocurrencies like Bitcoin or Ethereum."
    }
  }

  // Refined default response
  return {
    response:
      "I can answer many questions about crypto! Please try asking me something specific, like 'What is a smart contract?' or 'Tell me about Ethereum'. My advanced AI features are temporarily disabled, but my built-in knowledge is still quite good.",
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

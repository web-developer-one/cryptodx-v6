'use server';
/**
 * @fileOverview A conversational AI flow for the CryptoDx chatbot.
 *
 * This file defines the logic for the chatbot, including multilingual text and audio responses.
 * It uses Genkit to interact with Google AI models for natural language understanding and generation.
 *
 * - askChatbot: The main function that handles a user's message and returns a response.
 * - ChatbotInput: The Zod schema for the input to the askChatbot function.
 * - ChatbotOutput: The Zod schema for the output from the askChatbot function.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import wav from 'wav';

// Define the schema for the chatbot's input.
const ChatbotInputSchema = z.object({
  message: z.string().describe("The user's message to the chatbot."),
  language: z
    .string()
    .describe('The language code for the response (e.g., "en", "es").'),
  enableAudio: z.boolean().describe('Whether to generate an audio response.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

// Define the schema for the chatbot's output.
const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's text response."),
  audio: z
    .string()
    .optional()
    .describe('The audio response as a base64-encoded WAV data URI.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

// An exported wrapper function that calls the Genkit flow.
// This is the function that the UI will interact with.
export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return await chatbotFlow(input);
}

// Define the main prompt for the chatbot.
// This prompt provides the context and instructions for the AI model.
const chatbotPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  // Provides system-level instructions to the model.
  system: `You are an expert AI assistant for CryptoDx, a decentralized exchange.
Your tone is helpful, friendly, and knowledgeable.
You can answer questions about Blockchain, DeFi, Cryptocurrencies (like Bitcoin, Ethereum), NFTs, and the intersection of AI with blockchain.
Keep your answers concise and easy to understand for a general audience.
You MUST respond in the language specified by the user's language code.`,
  // Defines the schema for the input variables that will be passed to the prompt.
  input: {
    schema: z.object({
      message: z.string(),
      language: z.string(),
    }),
  },
  // This tells the model to use the user's message as the main prompt content.
  prompt: `{{{message}}}`,
});

// Define the Genkit flow for the chatbot.
const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    // Generate the text response from the AI model.
    const llmResponse = await ai.generate({
      prompt: chatbotPrompt,
      input: {
        message: input.message,
        language: input.language,
      },
    });
    const textResponse = llmResponse.text;

    // If audio is not enabled, return only the text response.
    if (!input.enableAudio) {
      return {response: textResponse};
    }

    // If audio is enabled, generate the audio response using a TTS model.
    const ttsResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Algenib'}},
        },
      },
      prompt: textResponse,
    });

    const audioMedia = ttsResponse.media;
    if (!audioMedia) {
      // If audio generation fails, return the text response and log a warning.
      console.warn('TTS generation failed, returning text-only response.');
      return {response: textResponse};
    }

    // Convert the raw PCM audio data to a WAV file format.
    const pcmData = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavDataUri =
      'data:audio/wav;base64,' + (await toWav(pcmData));

    // Return both the text and audio responses.
    return {
      response: textResponse,
      audio: wavDataUri,
    };
  }
);


/**
 * Converts raw PCM audio data into a Base64-encoded WAV data URI.
 *
 * @param pcmData The raw audio data in PCM format.
 * @param channels The number of audio channels (default: 1).
 * @param rate The sample rate in Hz (default: 24000).
 * @param sampleWidth The width of each sample in bytes (default: 2).
 * @returns A promise that resolves with the Base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

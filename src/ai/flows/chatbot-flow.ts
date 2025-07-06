'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import wav from 'wav';

const ChatbotInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chatbot.'),
  language: z.string().describe('The language for the response (e.g., "English", "Spanish").'),
  enableAudio: z.boolean().describe('Whether to generate an audio response.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s text response.'),
  audio: z.string().optional().describe('The audio response as a base64-encoded WAV data URI.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const chatbotPrompt = ai.definePrompt(
  {
    name: 'chatbotPrompt',
    input: {
      schema: z.object({
        message: z.string(),
        language: z.string(),
      }),
    },
    prompt: `You are an expert conversational AI specializing in Blockchain, DeFi, Crypto, NFTs, and Blockchain-related AI. Your designated name is 'CryptoDx Chatbot'.

You MUST adhere to the following rules strictly:
1.  ONLY answer questions related to your specialized topics.
2.  If a user asks about any other subject (especially Religion, Sex, Politics, or any inappropriate content), you MUST politely decline to answer and state that it is outside your scope of expertise.
3.  Your responses must be in the following language: {{{language}}}.
4.  EVERY response you provide MUST start with the following disclaimer on a new line: "Disclaimer: I am an AI assistant and cannot provide financial advice. All information is for educational purposes only."

User's question:
{{{message}}}
`,
  },
);

const audioFlow = ai.defineFlow(
  {
    name: 'audioFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (text) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavData = await toWav(audioBuffer);
    return 'data:audio/wav;base64,' + wavData;
  }
);


const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const {output: textResponse} = await chatbotPrompt({message: input.message, language: input.language});
    
    if (!textResponse) {
        throw new Error("Failed to generate a text response from the language model.");
    }
    
    let audioData: string | undefined = undefined;
    if (input.enableAudio) {
      try {
        audioData = await audioFlow(textResponse);
      } catch (error) {
        console.error("Audio generation failed, returning text-only response.", error);
        // Do not block the response if audio fails
      }
    }
    
    return {
      response: textResponse,
      audio: audioData,
    };
  }
);


// Helper to convert PCM audio buffer to WAV base64 string
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

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

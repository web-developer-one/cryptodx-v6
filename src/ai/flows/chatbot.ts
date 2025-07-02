'use server';
/**
 * @fileOverview A chatbot that can answer questions about various technology topics.
 *
 * - cryptoChat - A function that handles the chat process.
 * - CryptoChatInput - The input type for the cryptoChat function.
 * - CryptoChatOutput - The return type for the cryptoChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const CryptoChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The history of the conversation.'),
  userMessage: z.string().describe('The message from the user.'),
});
export type CryptoChatInput = z.infer<typeof CryptoChatInputSchema>;

const CryptoChatOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type CryptoChatOutput = z.infer<typeof CryptoChatOutputSchema>;


export async function cryptoChat(input: CryptoChatInput): Promise<CryptoChatOutput> {
  return cryptoChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cryptoChatPrompt',
  input: {schema: CryptoChatInputSchema},
  output: {schema: CryptoChatOutputSchema},
  prompt: `You are CryptoDx Chatbot, an expert AI assistant. Your role is to answer questions specifically on these topics:
- Cryptocurrency market information and general topics
- DeFi market information and general topics
- NFT market information and general topics
- Metaverse market information and general topics
- Blockchain technology, information, and topics
- AI technology, information, and topics

If a question is outside of these topics, you must respond with: "I'm afraid that I can not help you with that. I can answer questions on Blockchain, DeFi, Crypto, Metaverse, AI and such topics". Do not answer questions outside of your specified topics.

Engage in a helpful and friendly conversation, using the provided history to maintain context.

{{#each history}}
{{role}}: {{{content}}}
{{/each}}
user: {{{userMessage}}}
model: `,
  config: {
    // Lower temperature for more consistent, factual answers.
    temperature: 0.3,
  },
});


const cryptoChatFlow = ai.defineFlow(
  {
    name: 'cryptoChatFlow',
    inputSchema: CryptoChatInputSchema,
    outputSchema: CryptoChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output;

    if (!output) {
      // Fallback to raw text if structured output fails
      return { response: llmResponse.text };
    }
    
    return output;
  }
);

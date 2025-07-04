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
  prompt: `You are a helpful AI assistant.
Engage in a friendly conversation, using the provided history to maintain context.

{{#each history}}
{{role}}: {{{content}}}
{{/each}}
user: {{{userMessage}}}
model: `,
});


const cryptoChatFlow = ai.defineFlow(
  {
    name: 'cryptoChatFlow',
    inputSchema: CryptoChatInputSchema,
    outputSchema: CryptoChatOutputSchema,
  },
  async (input) => {
    try {
        const llmResponse = await prompt(input);
        const output = llmResponse.output;

        if (output?.response) {
            return output;
        }

        const rawText = llmResponse.text?.trim();
        if (rawText) {
            return { response: rawText };
        }
        
        // This case handles when the model returns nothing, not an error.
        return { response: "I'm sorry, I couldn't generate a response right now. Please try a different question." };

    } catch (e) {
        console.error("Error in cryptoChatFlow:", e);
        // This case handles when the prompt call itself fails.
        return { response: "Sorry, an error occurred while connecting to the AI service. Please try again later." };
    }
  }
);

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
import { getLatestListings } from '@/lib/coinmarketcap';

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

const getTokenInfo = ai.defineTool(
    {
        name: 'getTokenInfo',
        description: 'Looks up a cryptocurrency on the CryptoDx platform by its name or symbol. Returns the token ID if found, which can be used to build a link to the token detail page.',
        inputSchema: z.object({
            tokenQuery: z.string().describe('The name or symbol of the cryptocurrency to search for, e.g., "Bitcoin" or "BTC".'),
        }),
        outputSchema: z.object({
            found: z.boolean(),
            id: z.number().optional(),
            name: z.string().optional(),
            symbol: z.string().optional(),
        }),
    },
    async ({ tokenQuery }) => {
        const { data: tokens, error } = await getLatestListings();
        if (error || !tokens || tokens.length === 0) {
            if (error) {
                console.error(`Chatbot tool 'getTokenInfo' failed to fetch tokens:`, error);
            }
            return { found: false };
        }

        const query = tokenQuery.toLowerCase();
        const token = tokens.find(
            (t) => t.name.toLowerCase() === query || t.symbol.toLowerCase() === query
        );

        if (token) {
            return {
                found: true,
                id: token.id,
                name: token.name,
                symbol: token.symbol,
            };
        }
        return { found: false };
    }
);

const prompt = ai.definePrompt({
  name: 'cryptoChatPrompt',
  input: {schema: CryptoChatInputSchema},
  output: {schema: CryptoChatOutputSchema},
  tools: [getTokenInfo],
  prompt: `You are a helpful AI assistant for the CryptoDx platform.
Engage in a friendly conversation, using the provided history to maintain context.

If the user asks about a specific cryptocurrency, use the \`getTokenInfo\` tool to check if it's available on the platform.
- If the token is found, answer the user's question and include a Markdown link to the token's detail page in your response.
- The link format MUST be: \`[View {Token Name} details](/tokens/{id})\`. For example: \`[View Bitcoin details](/tokens/1)\`.
- If the token is not found, inform the user that you couldn't find information about that token on the platform.

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

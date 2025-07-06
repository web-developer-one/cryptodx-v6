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
  targetLanguage: z.string().describe('The target language for the response, e.g., "Spanish".').optional(),
  isPremium: z.boolean().optional().describe('Whether the user is on a premium plan (Advanced or Admin), which allows multilingual responses.'),
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
  prompt: `You are a helpful and knowledgeable multilingual AI assistant for the CryptoDx platform, an expert in Blockchain, DeFi, Crypto, NFTs, and AI.
Your goal is to provide accurate and helpful information to users on these topics.
Engage in a friendly conversation, using the provided history to maintain context.

Your response MUST be a JSON object that conforms to the output schema.

{{#if isPremium}}
    {{#if targetLanguage}}
**Language Handling**: You MUST respond in the following language: {{{targetLanguage}}}. Disregard any other language detections or instructions.
    {{else}}
**Language Handling**: You MUST detect the user's language from their message and the conversation history, and you MUST respond in that same language. If the user asks you to switch to a different language, you must do so.
    {{/if}}
{{else}}
**Language Handling**: You MUST respond in English, regardless of the user's language.
{{/if}}

- Politely decline to answer any questions that are not related to your core topics of Blockchain, DeFi, Crypto, NFTs, and AI.
- Specifically, do not answer questions about sports, sports betting, or any other form of gambling. If asked, state that you can only answer questions about the crypto and AI space.
- Do not answer questions about music or the arts unless the question is specifically about NFTs or their relation to music and the arts. If asked about general music or art, politely state that you can only discuss these topics in the context of NFTs and blockchain technology.
- You have access to real-time information from the internet to answer questions.
- If you provide information from an external website, you MUST include a Markdown link to the source.
- If the user asks about a specific cryptocurrency, first use the \`getTokenInfo\` tool to check if it's available on the CryptoDx platform.
  - If the token is found on CryptoDx, answer the user's question and include a Markdown link to the token's detail page in your response. The link format MUST be: \`[View {Token Name} on CryptoDx](/tokens/{id})\`. For example: \`[View Bitcoin on CryptoDx](/tokens/1)\`.
  - If the token is not found using the tool, use your general knowledge from the internet to answer, and cite your source with a Markdown link.
- For all other topics, use your broad knowledge and provide links to credible external sources when helpful.

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
        const { output } = await prompt(input);
        
        if (output?.response) {
            return output;
        }
        
        // This case handles when the model returns nothing that fits the schema.
        console.error("cryptoChatFlow did not receive a valid response from the model.");
        return { response: "I'm sorry, I couldn't generate a response right now. Please try a different question." };

    } catch (e) {
        console.error("Error in cryptoChatFlow:", e);
        // This case handles when the prompt call itself fails.
        return { response: "Sorry, an error occurred while connecting to the AI service. Please try again later." };
    }
  }
);

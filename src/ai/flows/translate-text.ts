'use server';
/**
 * @fileOverview An AI flow for translating a structured JSON object of texts into a specified language.
 *
 * - translateTexts - A function that handles the translation process.
 * - TranslateTextsInput - The input type for the translateTexts function.
 * - TranslateTextsOutput - The return type for the translateTexts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextsInputSchema = z.object({
  texts: z.record(z.any()).describe('A JSON object with keys and string values to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "Japanese").'),
});
export type TranslateTextsInput = z.infer<typeof TranslateTextsInputSchema>;

// The output schema must match the structure of the input texts.
const TranslateTextsOutputSchema = z.object({
  translations: z.record(z.any()).describe('The translated JSON object, with the same keys as the input.'),
});
export type TranslateTextsOutput = z.infer<typeof TranslateTextsOutputSchema>;


export async function translateTexts(
  input: TranslateTextsInput
): Promise<TranslateTextsOutput> {
  return translateTextsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'translateTextsPrompt',
  input: {schema: TranslateTextsInputSchema},
  output: {schema: TranslateTextsOutputSchema},
  prompt: `You are a professional translator. Translate the values of the following JSON object into {{targetLanguage}}.
Your output MUST be a JSON object with a single key "translations" which contains the translated version of the input JSON.
It is crucial that you preserve the exact JSON structure of the input, including all keys and nesting, within the "translations" object.

Only translate the string values.
Do NOT translate any text that is inside curly braces, like {this}. These are placeholders for variables and must remain in English.
Do NOT translate cryptocurrency names (e.g., Bitcoin, Ethereum), their symbols (e.g., BTC, ETH), or technical terms like "API Key", "Market Cap", "TVL", "APR".

Input JSON to translate:
\`\`\`json
{{{json texts}}}
\`\`\`
`,
  config: {
      temperature: 0.1, // Be precise
  }
});


const translateTextsFlow = ai.defineFlow(
  {
    name: 'translateTextsFlow',
    inputSchema: TranslateTextsInputSchema,
    outputSchema: TranslateTextsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (output) {
      return output;
    }
    // If translation fails, we should throw an error so the UI can handle it (e.g., revert to English).
    // Returning an empty object would wipe out all text.
    console.error('Translation flow failed to get a structured response from the model.');
    throw new Error('Translation failed to generate a response.');
  }
);

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
It is crucial that you preserve the exact JSON structure, including all keys and nesting. Only translate the string values.

Input JSON:
\`\`\`json
{{{json texts}}}
\`\`\`

Respond with only the translated JSON object.`,
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
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Translation flow did not produce an output.");
    }
    return { translations: output.translations };
  }
);

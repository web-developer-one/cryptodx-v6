'use server';
/**
 * @fileOverview An AI flow for converting speech to text from an audio data URI.
 *
 * - speechToText - A function that handles the speech-to-text process.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import {ai, googleAI} from '@/ai/genkit';
import {z} from 'genkit';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}


const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input: SpeechToTextInput) => {
    const { text } = await ai.generate({
      // Gemini 1.5 Flash is great for multimodal tasks.
      model: googleAI.model('gemini-1.5-flash-latest'),
      prompt: [
        { media: { url: input.audioDataUri } },
        { text: 'Transcribe the audio. The user can speak in any language, so please auto-detect the language and provide the transcript in that language.' },
      ],
    });
    
    if (!text?.trim()) {
      throw new Error('No transcript was returned from the AI service.');
    }
    
    return { transcript: text.trim() };
  }
);

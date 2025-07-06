'use server';
/**
 * @fileOverview An AI flow for assessing the reputation of a cryptocurrency token.
 *
 * This flow uses Genkit to analyze a token's name and symbol to identify potential
 * risks, scams, or negative sentiment associated with it. It can generate reports
 * in multiple languages and provide an audio summary for users with the 'Advanced' plan.
 *
 * - getReputationReport: The main function to call to get a reputation report.
 * - ReputationInput: The Zod schema for the input.
 * - ReputationOutput: The Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import wav from 'wav';

// Define the input schema for the reputation flow.
const ReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency token.'),
  tokenSymbol: z.string().describe('The symbol of the cryptocurrency token.'),
  language: z
    .string()
    .describe('The language code for the report (e.g., "en", "es").'),
  enableAudio: z
    .boolean()
    .describe('Whether to generate an audio version of the report summary.'),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

// Define the output schema for the reputation flow.
const ReputationOutputSchema = z.object({
  report: z.object({
    status: z
      .enum(['clear', 'warning', 'critical'])
      .describe(
        'Overall reputation status. "clear" for no issues, "warning" for minor concerns, and "critical" for major red flags.'
      ),
    summary: z
      .string()
      .describe('A brief, one-sentence summary of the findings in the specified language.'),
    findings: z
      .array(
        z.object({
          title: z.string().describe('A short, descriptive title for the finding.'),
          description: z
            .string()
            .describe('A detailed, user-friendly description of the potential issue.'),
          source: z
            .string()
            .describe(
              'The source of the information (e.g., "On-chain Analysis", "Social Media Scan", "News Aggregation").'
            ),
          severity: z.enum(['low', 'medium', 'high']).describe('The severity of the finding.'),
          sourceUrl: z.string().optional().describe('A valid URL to a reputable source that backs up the finding, such as a news article or blockchain explorer transaction. A Google search link is also acceptable. This is optional.'),
        })
      )
      .describe('A list of specific findings. Return an empty array if the status is "clear".'),
  }),
  audio: z
    .string()
    .optional()
    .describe('The audio report summary as a base64-encoded WAV data URI.'),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

// The exported wrapper function that the UI interacts with.
export async function getReputationReport(
  input: ReputationInput
): Promise<ReputationOutput> {
  return await reputationFlow(input);
}

// Define the prompt for the reputation analysis. This prompt relies on Genkit's
// structured output capabilities (via the output schema) rather than explicitly
// asking for JSON in the text. This is a more robust method.
const reputationPrompt = ai.definePrompt({
  name: 'reputationPrompt',
  prompt: `You are a cryptocurrency risk assessment AI. Your task is to analyze the provided token and generate a risk report in the specified language.

Based on the token's name and symbol, search for any known scams, "rug pulls", security vulnerabilities, or other negative news.

If there are no issues, set the status to "clear".
If there are potential concerns, set the status to "warning".
If there are major red flags, set the status to "critical".

Provide a one-sentence summary and a list of specific findings if any issues are detected. For each finding, if you can find a reputable source (like a news article, blog post, or blockchain explorer page), provide a valid "sourceUrl" linking to it. A link to a search engine query is also acceptable. If no direct source is available, you may omit the "sourceUrl".

Language for report: {{{language}}}
Token to analyze:
Name: {{{tokenName}}}
Symbol: {{{tokenSymbol}}}`,
  input: {
    schema: z.object({
      tokenName: z.string(),
      tokenSymbol: z.string(),
      language: z.string(),
    }),
  },
  output: {
    schema: ReputationOutputSchema.shape.report,
  },
});


// Define the main Genkit flow for reputation checking.
const reputationFlow = ai.defineFlow(
  {
    name: 'reputationFlow',
    inputSchema: ReputationInputSchema,
    outputSchema: ReputationOutputSchema,
  },
  async (input) => {
    // Generate the reputation report by calling the defined prompt.
    const llmResponse = await reputationPrompt(
      {
        tokenName: input.tokenName,
        tokenSymbol: input.tokenSymbol,
        language: input.language,
      },
      {
        // Using a more capable model for analysis tasks.
        model: 'gemini-1.5-pro-latest',
      }
    );

    const report = llmResponse.output;

    // If the report generation fails, throw an error.
    if (!report) {
      throw new Error('Failed to generate reputation report from the AI model.');
    }

    // If audio is not enabled, or the report is clear, return the text report.
    if (!input.enableAudio || report.status === 'clear') {
      return {report};
    }

    // Generate the audio summary.
    const ttsResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Algenib'}},
        },
      },
      prompt: report.summary,
    });

    const audioMedia = ttsResponse.media;
    if (!audioMedia) {
      console.warn('TTS generation failed for reputation report, returning text-only.');
      return {report};
    }

    // Convert PCM to WAV.
    const pcmData = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavDataUri =
      'data:audio/wav;base64,' + (await toWav(pcmData));

    // Return the full report with audio.
    return {
      report,
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

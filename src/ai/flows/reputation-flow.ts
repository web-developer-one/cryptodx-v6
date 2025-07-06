'use server';

import {ai} from '@/ai/genkit';
import type {ReputationReport} from '@/lib/types';
import {z} from 'zod';
import wav from 'wav';

const ReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency token.'),
  tokenSymbol: z.string().describe('The symbol of the cryptocurrency token.'),
  language: z.string().describe('The language for the report (e.g., "English", "Spanish").'),
  enableAudio: z.boolean().describe('Whether to generate an audio version of the report summary.'),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

const ReputationOutputSchema = z.object({
  report: z.object({
    status: z.enum(['clear', 'warning', 'critical']).describe('Overall reputation status.'),
    summary: z.string().describe('A brief one-sentence summary of the findings.'),
    findings: z.array(z.object({
      title: z.string().describe('A short title for the finding.'),
      description: z.string().describe('A detailed description of the potential issue.'),
      source: z.string().describe('The source of the information (e.g., "On-chain Analysis", "Social Media Scan").'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the finding.'),
    })).describe('A list of specific findings.'),
  }),
  audio: z.string().optional().describe('The audio report as a base64-encoded WAV data URI.'),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

export async function getReputationReport(input: ReputationInput): Promise<ReputationOutput> {
  return reputationFlow(input);
}

const reputationPrompt = ai.definePrompt({
  name: 'reputationPrompt',
  input: {
    schema: z.object({tokenName: z.string(), tokenSymbol: z.string(), language: z.string()}),
  },
  output: {
    schema: ReputationOutputSchema.pick({report: true}).shape.report
  },
  prompt: `You are a cryptocurrency security analyst. Your task is to generate a simulated reputation report for the given token.

Analyze the token based on simulated data regarding its history for known issues like scams, rug pulls, smart contract vulnerabilities, or major negative community events.

Your report must be in {{{language}}}.

Token Name: {{{tokenName}}}
Token Symbol: ({{{tokenSymbol}}})

Generate a realistic but fictional report. If there are no major issues, give it a 'clear' status. If there are some concerns, use 'warning'. If there are severe issues, use 'critical'.
Provide a concise one-sentence summary and 2-3 detailed findings with a title, description, source, and severity for each.
`,
});

const audioFlow = ai.defineFlow(
  {
    name: 'reputationAudioFlow',
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

const reputationFlow = ai.defineFlow(
  {
    name: 'reputationFlow',
    inputSchema: ReputationInputSchema,
    outputSchema: ReputationOutputSchema,
  },
  async (input) => {
    const {output} = await reputationPrompt({
        tokenName: input.tokenName,
        tokenSymbol: input.tokenSymbol,
        language: input.language
    });
    const report = output as ReputationReport;

    if (!report) {
      throw new Error("Failed to generate a reputation report.");
    }
    
    let audioData: string | undefined = undefined;
    if (input.enableAudio && report.summary) {
      try {
        audioData = await audioFlow(report.summary);
      } catch (error) {
        console.error("Reputation audio generation failed, returning text-only report.", error);
      }
    }
    
    return {
      report,
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

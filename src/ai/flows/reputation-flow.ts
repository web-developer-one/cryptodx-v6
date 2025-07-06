
'use server';

import type {ReputationReport} from '@/lib/types';
import {z} from 'zod';

// This file has been modified to gracefully handle the absence of Genkit AI packages,
// which are causing installation errors in the current environment.

// Helper to create a WAV file from raw PCM data. This avoids external dependencies.
function pcmToWav(pcmData: Buffer): string {
  const numChannels = 1;
  const sampleRate = 24000;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Sub-chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // Bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([buffer, pcmData]);
  return 'data:audio/wav;base64,' + wavBuffer.toString('base64');
}

const errorMessages = {
  en: 'AI reputation check is currently unavailable due to a configuration issue.',
  es: 'La verificación de reputación por IA no está disponible actualmente debido a un problema de configuración.',
  fr: "La vérification de la réputation par l'IA est actuellement indisponible en raison d'un problème de configuration."
};

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

const ReputationOutputSchema = z.object({
  report: z.object({
    status: z
      .enum(['clear', 'warning', 'critical'])
      .describe('Overall reputation status.'),
    summary: z
      .string()
      .describe('A brief one-sentence summary of the findings.'),
    findings: z
      .array(
        z.object({
          title: z.string().describe('A short title for the finding.'),
          description: z
            .string()
            .describe('A detailed description of the potential issue.'),
          source: z
            .string()
            .describe(
              'The source of the information (e.g., "On-chain Analysis", "Social Media Scan").'
            ),
          severity: z
            .enum(['low', 'medium', 'high'])
            .describe('The severity of the finding.'),
        })
      )
      .describe('A list of specific findings.'),
  }),
  audio: z
    .string()
    .optional()
    .describe('The audio report as a base64-encoded WAV data URI.'),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

export async function getReputationReport(
  input: ReputationInput
): Promise<ReputationOutput> {
  console.warn("Reputation report call was made, but the feature is disabled due to a package installation issue.");
  
  const lang = (input.language in errorMessages ? input.language : 'en') as keyof typeof errorMessages;
  const message = errorMessages[lang];

  // The UI component that calls this function has a try/catch block.
  // Throwing an error will trigger its error state, which is the desired behavior.
  throw new Error(message);
}

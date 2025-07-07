
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { googleSearch } from '@genkit-ai/googleai';

// Input and Output schemas for the reputation check.
export const ReputationInputSchema = z.object({
  tokenName: z.string(),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

export const ReputationOutputSchema = z.object({
  report: z.string(),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

// Exported function that the API route will call.
export async function checkReputation(
  input: ReputationInput
): Promise<ReputationOutput> {
  return reputationFlow(input);
}

// This is the core Genkit flow that interacts with the AI model.
const reputationFlow = ai.defineFlow(
  {
    name: 'reputationFlow',
    inputSchema: ReputationInputSchema,
    outputSchema: ReputationOutputSchema,
  },
  async (input) => {
    // This prompt asks the AI to act as an analyst and provide a structured report.
    const prompt = `
        You are a crypto security analyst. Please perform a comprehensive reputation check for the cryptocurrency token: "${input.tokenName}".
        Use the provided search tool to find real-time information from the internet. Your analysis should cover the following points:

        1.  **Social Media Sentiment:** Analyze recent discussions on platforms like X (formerly Twitter) and Reddit. What is the general sentiment (Positive, Negative, Neutral)? Are there any significant discussions, red flags, or positive endorsements from reputable sources?

        2.  **Developer Activity & Community:** Look for signs of active development (e.g., GitHub commits if available) and an engaged community. Is the project team transparent?

        3.  **Potential Red Flags:** Identify any common red flags such as accusations of being a scam, lack of communication from the team, unresolved community issues, or suspicious wallet activities if mentioned in public discussions.

        4.  **Overall Summary:** Provide a concise summary of your findings and a final reputation score from 1 to 10 (1 being very poor, 10 being excellent).

        Structure your response clearly with headings for each section. Use Markdown for formatting (e.g., **Heading** for bold headings).
        Cite your sources with URLs where possible.
    `;

    // We pass the googleSearch tool to the generate call to allow the model to access the internet.
    const response = await ai.generate({
      prompt,
      tools: [googleSearch],
    });
    
    const reportText = response.text;

    if (!reportText) {
      throw new Error('The AI model failed to generate a report.');
    }
    
    // We wrap the plain text response into the object required by our output schema.
    return { report: reportText };
  }
);

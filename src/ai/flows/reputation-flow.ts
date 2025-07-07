
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';
// Removed the googleSearch import as it was causing server errors.

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
    // This prompt asks the AI to act as an analyst and provide a structured report based on its internal knowledge.
    const prompt = `
        You are a crypto security analyst. Please perform a comprehensive reputation check for the cryptocurrency token: "${input.tokenName}".
        Your analysis should cover the following points based on your knowledge up to your last training data:

        1.  **Social Media Sentiment:** Analyze common discussions on platforms like X (formerly Twitter) and Reddit. What is the general sentiment (Positive, Negative, Neutral)? Are there any significant discussions, red flags, or positive endorsements from reputable sources?

        2.  **Developer Activity & Community:** Look for signs of active development and an engaged community. Is the project team transparent?

        3.  **Potential Red Flags:** Identify any common red flags such as accusations of being a scam, lack of communication from the team, or unresolved community issues.

        4.  **Overall Summary:** Provide a concise summary of your findings and a final reputation score from 1 to 10 (1 being very poor, 10 being excellent).

        Structure your response clearly with headings for each section. Use Markdown for formatting (e.g., **Heading** for bold headings).
        Cite your sources with URLs where possible, if you have them in your knowledge base.
    `;

    // The AI will generate a report based on its training data without live web access.
    const response = await ai.generate({
      prompt,
    });
    
    const reportText = response.text;

    if (!reportText) {
      throw new Error('The AI model failed to generate a report.');
    }
    
    // We wrap the plain text response into the object required by our output schema.
    return { report: reportText };
  }
);

'use server';

/**
 * @fileOverview AI agent that generates a basic landing page with placeholder content and a pre-designed UI.
 *
 * - generateLandingPage - A function that handles the landing page generation process.
 * - GenerateLandingPageInput - The input type for the generateLandingPage function.
 * - GenerateLandingPageOutput - The return type for the generateLandingPage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLandingPageInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('The description of the project for which the landing page is generated.'),
  primaryColor: z
    .string()
    .default('#2BCDC1')
    .describe('The primary color for the landing page.'),
  backgroundColor: z
    .string()
    .default('#F0F0F0')
    .describe('The background color for the landing page.'),
  accentColor: z
    .string()
    .default('#41E2D4')
    .describe('The accent color for the landing page.'),
  fontHeading: z
    .string()
    .default("'Space Grotesk', sans-serif")
    .describe('The font for the heading of the landing page.'),
  fontBody: z
    .string()
    .default("'Inter', sans-serif")
    .describe('The font for the body of the landing page.'),
});
export type GenerateLandingPageInput = z.infer<typeof GenerateLandingPageInputSchema>;

const GenerateLandingPageOutputSchema = z.object({
  landingPageCode: z
    .string()
    .describe('The generated code for the landing page, including UI and placeholder content.'),
});
export type GenerateLandingPageOutput = z.infer<typeof GenerateLandingPageOutputSchema>;

export async function generateLandingPage(
  input: GenerateLandingPageInput
): Promise<GenerateLandingPageOutput> {
  return generateLandingPageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLandingPagePrompt',
  input: {schema: GenerateLandingPageInputSchema},
  output: {schema: GenerateLandingPageOutputSchema},
  prompt: `You are an expert front-end developer. Generate a basic landing page with placeholder content and a pre-designed UI based on the project description.

Project Description: {{{projectDescription}}}
Primary Color: {{{primaryColor}}}
Background Color: {{{backgroundColor}}}
Accent Color: {{{accentColor}}}
Heading Font: {{{fontHeading}}}
Body Font: {{{fontBody}}}

Return only the code for the landing page. Ensure that the code is well-formatted and readable.
`,
});

const generateLandingPageFlow = ai.defineFlow(
  {
    name: 'generateLandingPageFlow',
    inputSchema: GenerateLandingPageInputSchema,
    outputSchema: GenerateLandingPageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

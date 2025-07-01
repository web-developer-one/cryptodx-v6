// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a tech stack based on a project description.
 *
 * - suggestTechStack - A function that takes a project description as input and returns a suggested tech stack with configurations.
 * - SuggestTechStackInput - The input type for the suggestTechStack function.
 * - SuggestTechStackOutput - The return type for the suggestTechStack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTechStackInputSchema = z.object({
  projectDescription: z.string().describe('A description of the project.'),
});
export type SuggestTechStackInput = z.infer<typeof SuggestTechStackInputSchema>;

const SuggestTechStackOutputSchema = z.object({
  techStack: z.array(z.string()).describe('An array of suggested technologies for the project.'),
  configurations: z
    .array(z.string())
    .describe('An array of suggested configurations for the project, like ESLint and Prettier.'),
});
export type SuggestTechStackOutput = z.infer<typeof SuggestTechStackOutputSchema>;

export async function suggestTechStack(input: SuggestTechStackInput): Promise<SuggestTechStackOutput> {
  return suggestTechStackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTechStackPrompt',
  input: {schema: SuggestTechStackInputSchema},
  output: {schema: SuggestTechStackOutputSchema},
  prompt: `You are a software architect. Based on the project description provided, you will suggest an appropriate tech stack and configurations.

Project Description: {{{projectDescription}}}

Suggest a tech stack and configurations for the project. Return the tech stack as an array of strings, and configurations as an array of strings.
`,
});

const suggestTechStackFlow = ai.defineFlow(
  {
    name: 'suggestTechStackFlow',
    inputSchema: SuggestTechStackInputSchema,
    outputSchema: SuggestTechStackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview An AI flow for assessing the reputation of a cryptocurrency token.
 *
 * This flow uses Genkit to analyze a token's name and symbol to identify potential
 * risks, scams, or negative sentiment associated with it, based on principles of
 * on-chain and off-chain analysis.
 *
 * - getReputationReport: The main function to call to get a reputation report.
 * - ReputationInput: The Zod schema for the input.
 * - ReputationOutput: The Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the reputation flow.
const ReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency token.'),
  tokenSymbol: z.string().describe('The symbol of the cryptocurrency token.'),
  language: z.string().describe('The language code for the report (e.g., "en", "es").'),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

// Define a very flexible output schema to prevent validation errors.
// The AI will be prompted for detailed info, but the schema only requires the basics.
const ReputationOutputSchema = z.object({
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
        title: z.string().optional().nullable().describe('A short, descriptive title for the finding.'),
        description: z
          .string()
          .optional()
          .nullable()
          .describe('A detailed, user-friendly description of the potential issue.'),
        source: z
          .string()
          .optional()
          .nullable()
          .describe(
            'The source of the information (e.g., "On-chain Analysis", "Social Media Scan", "News Aggregation").'
          ),
        severity: z.enum(['low', 'medium', 'high']).optional().nullable().describe('The severity of the finding.'),
        sourceUrl: z.string().optional().nullable().describe('A valid URL to a reputable source that backs up the finding, such as a news article or blockchain explorer transaction. A Google search link is also acceptable.'),
      })
    )
    .optional()
    .describe('A list of specific findings. Return an empty array if the status is "clear".'),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

// The exported wrapper function that the UI interacts with.
export async function getReputationReport(
  input: ReputationInput
): Promise<ReputationOutput> {
  return await reputationFlow(input);
}

// Define the prompt for the reputation analysis, based on expert principles.
const reputationPrompt = ai.definePrompt({
  name: 'reputationPrompt',
  input: {
    schema: ReputationInputSchema,
  },
  output: {
    schema: ReputationOutputSchema,
  },
  prompt: `You are a cryptocurrency risk assessment AI. Your task is to analyze the provided token and generate a risk report in the specified language.
  
Act like a blockchain analyst. Based on the token's name and symbol, search for key reputation indicators.
Your analysis should check for:
- Known scams, "rug pulls", or security vulnerabilities.
- Lack of a public security audit from a reputable firm.
- Unverified smart contract source code on a major block explorer.
- Negative news or widespread community complaints.
- Excessive owner/admin privileges in the smart contract that could pose a risk to holders.

If there are no significant issues, set the status to "clear".
If there are potential concerns or some missing information (like no audit), set the status to "warning".
If there are major red flags (like a known scam or major vulnerability), set the status to "critical".

Provide a one-sentence summary and a list of specific findings if any issues are detected.
For each finding, if you can find a reputable source (like a news article, blog post, or blockchain explorer page), provide a valid "sourceUrl" linking to it. A link to a search engine query is also acceptable. If no direct source is available, you may omit the "sourceUrl". Provide a severity for each finding.

Language for report: {{{language}}}
Token to analyze:
Name: {{{tokenName}}}
Symbol: {{{tokenSymbol}}}`,
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

    return report;
  }
);

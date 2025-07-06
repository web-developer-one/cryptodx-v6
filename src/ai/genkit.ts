
'use server';

/**
 * @fileoverview This file contains a placeholder for the Genkit AI object.
 * The real Genkit packages are currently causing installation issues in the environment.
 * This placeholder allows the application to build and run, but AI features
 * will be disabled and will return error messages.
 */

// A placeholder 'ai' object to prevent build failures.
export const ai = {
  // Mock `definePrompt` to return a function that returns a dummy response.
  // The actual implementation in the flow will handle the error message.
  definePrompt: () => async (input: any) => {
    console.warn(
      'Genkit is disabled due to package installation issues. AI prompt was not sent.'
    );
    return { text: '', output: null };
  },

  // Mock `defineFlow` to just return the flow's implementation function.
  defineFlow: (config: any, implementation: any) => implementation,

  // Mock `generate` to return a structure that won't crash the calling code.
  generate: async (options: any) => {
    console.warn(
      'Genkit is disabled due to package installation issues. AI generation was not performed.'
    );
    return { media: null };
  },
};

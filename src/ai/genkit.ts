import {genkit} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/google-ai';

const googleAI = googleAIPlugin();

export const ai = genkit({
  plugins: [googleAI],
});

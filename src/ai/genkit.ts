import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY required');
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY })
  ],
  model: 'googleai/gemini-2.0-flash',
});
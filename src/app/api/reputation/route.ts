
'use server';

import {NextResponse} from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_API_KEY;

// Define safety settings, similar to the chat route
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


export async function POST(req: Request) {
  if (!API_KEY) {
    console.error('GOOGLE_API_KEY is not set for reputation check');
    return NextResponse.json(
      {
        error: 'GOOGLE_API_KEY_MISSING',
        message: 'The AI API key is not configured on the server. Please set the GOOGLE_API_KEY environment variable.'
      },
      {status: 500}
    );
  }

  try {
    const {tokenName} = await req.json();

    if (!tokenName) {
      return NextResponse.json({error: 'Token name is required'}, {status: 400});
    }

    // Construct the prompt for the reputation check
    const prompt = `
        You are a crypto security analyst. Please perform a comprehensive reputation check for the cryptocurrency token: "${tokenName}".
        Your analysis should cover the following points based on your knowledge up to your last training data:

        1.  **Social Media Sentiment:** Analyze common discussions on platforms like X (formerly Twitter) and Reddit. What is the general sentiment (Positive, Negative, Neutral)? Are there any significant discussions, red flags, or positive endorsements from reputable sources?

        2.  **Developer Activity & Community:** Look for signs of active development and an engaged community. Is the project team transparent?

        3.  **Potential Red Flags:** Identify any common red flags such as accusations of being a scam, lack of communication from the team, or unresolved community issues.

        4.  **Overall Summary:** Provide a concise summary of your findings and a final reputation score from 1 to 10 (1 being very poor, 10 being excellent).

        Structure your response clearly with headings for each section. Use Markdown for formatting (e.g., **Heading** for bold headings).
        Cite your sources with URLs where possible, if you have them in your knowledge base.
    `;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7, // A bit more creative for a report
        },
        safetySettings,
    });

    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('The AI model failed to generate a report.');
    }
    
    // Return the report in the expected format for the frontend
    return NextResponse.json({ report: responseText });

  } catch (error: any) {
    console.error('Error in reputation API route:', error);
    return NextResponse.json(
      {
        error: 'AI_SERVICE_ERROR',
        message: error.message || 'The AI service failed to process the request.'
      },
      {status: 500}
    );
  }
}

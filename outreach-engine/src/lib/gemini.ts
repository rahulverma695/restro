import { GoogleGenAI, Type } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getCredentials() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    }
  }
  return undefined;
}

export function getClient(): GoogleGenAI {
  if (!genAI) {
    const isVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true';
    if (isVertex) {
      const project = process.env.GOOGLE_CLOUD_PROJECT;
      const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
      const creds = getCredentials();
      
      genAI = new GoogleGenAI({
        vertexai: true,
        project,
        location,
        ...(creds ? { googleAuthOptions: { credentials: creds } } : {}),
      });
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('REPLACE_WITH_YOUR')) {
        throw new Error('GEMINI_API_KEY is not set correctly in env');
      }
      genAI = new GoogleGenAI({ apiKey });
    }
  }
  return genAI;
}

const MODEL = 'gemini-2.5-flash';

interface EmailVariant {
  subject: string;
  body: string;
}

/**
 * Generates a textually unique variant of a cold email sequence step using Gemini.
 * It strictly retains any links or pricing variables but rephrases to bypass spam filters.
 */
export async function generateEmailVariant(
  subjectTemplate: string,
  bodyTemplate: string,
  leadInfo: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
    website?: string;
    email: string;
  }
): Promise<EmailVariant> {
  const client = getClient();
  
  const prompt = `
    You are an expert sales copywriter. I want you to rewrite a cold email template to make it textually unique while retaining the exact same call to action, links, key value metrics, and placeholders.
    This rewrite is critical to avoid automated email spam filters.

    Lead Context:
    - Recipient Name: ${leadInfo.first_name || 'there'} ${leadInfo.last_name || ''}
    - Company Name: ${leadInfo.company_name || 'your company'}
    - Website: ${leadInfo.website || 'N/A'}
    - Email: ${leadInfo.email}

    Original Subject Template:
    "${subjectTemplate}"

    Original Body Template:
    "${bodyTemplate}"

    Instructions:
    1. Replace placeholders like {{first_name}} or {{company_name}} with the actual lead details provided above. If details are missing, use natural defaults (e.g. "your team", "your company", "there").
    2. Rewrite the subject line to be catchy, concise, and completely different in wording but identical in intent.
    3. Rephrase the body copy: change greetings, switch active/passive voices, reorganize list items or points, rewrite sentences, but KEEP the links, email addresses, phone numbers, or price points exactly identical. Do not invent any pricing or links not present in the template.
    4. Maintain a professional, crisp, and non-spammy tone of voice.
  `;

  const response = await client.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.8,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: {
            type: Type.STRING,
            description: 'The rewritten, personalized subject line.'
          },
          body: {
            type: Type.STRING,
            description: 'The rewritten, personalized email body. Retain double line breaks for paragraph separation.'
          }
        },
        required: ['subject', 'body']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Received empty response from Gemini model');
  }

  return JSON.parse(text) as EmailVariant;
}

# Base Project Rules & Stack Template

Drop this file into the root of any new project (name it **`AGENTS.md`** or **`.cursorrules`**) to instantly bootstrap new chats with our verified technical architecture.

---

## 1. Technical Stack Configuration
* **Framework:** Next.js (App Router, React 19). Use React Server Components (RSC) for data fetching and Server Actions for database mutations.
* **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
* **AI Integration:** Google Cloud Vertex AI using the unified `@google/genai` SDK.
* **Hosting & Deployment:** Vercel.

---

## 2. Verified Implementation Patterns

### Database Connection (Neon Singleton)
Always use a singleton pattern for the database connection to prevent pool exhaustion during hot-reloads in serverless/dev environments.
* **Location:** `src/lib/db.ts`
```typescript
import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

export function getDB() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url || url.includes('REPLACE_WITH_YOUR')) {
      throw new Error('DATABASE_URL is not set correctly in env');
    }
    sql = neon(url);
  }
  return sql;
}
```

### Vertex AI Client Connection (Google Gen AI Unified SDK)
Always use the singleton wrapper for Vertex AI to route requests using Google Cloud promotional/free trial credits.
* **Location:** `src/lib/gemini.ts`
```typescript
import { GoogleGenAI } from '@google/genai';

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

export async function streamResponse(
  userMessage: string,
  history: any[],
  onChunk: (text: string) => void,
  onDone: () => void,
  systemInstruction?: string,
) {
  const client = getClient();
  const response = await client.models.generateContentStream({
    model: MODEL,
    contents: [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      ...(systemInstruction ? { systemInstruction } : {}),
      tools: [{ codeExecution: {} } as any],
    },
  });

  for await (const chunk of response) {
    for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) onChunk(part.text);
      if (part.codeExecutionResult) {
        onChunk(`\n**Result:**\n\`\`\`\n${part.codeExecutionResult.output}\n\`\`\`\n`);
      }
    }
  }
  onDone();
}
```

---

## 3. Environment Variables Template (`.env.local`)
Create a `.env.local` containing the database connection and Vertex AI credentials:

```env
# Database
DATABASE_URL="postgresql://neondb_owner:..."

# Vertex AI (Enable to draw from GCP free credits)
GOOGLE_GENAI_USE_VERTEXAI="true"
GOOGLE_CLOUD_PROJECT="gen-lang-client-0474812734"
GOOGLE_CLOUD_LOCATION="us-central1"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ...}'

# Fallback (Google AI Studio)
GEMINI_API_KEY="AIzaSy..."
```

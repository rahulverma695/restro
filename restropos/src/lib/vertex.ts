import { VertexAI } from "@google-cloud/vertexai";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

// Credentials come from GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
// OR from GOOGLE_SERVICE_ACCOUNT_JSON env var (the JSON content directly, for Vercel)
function getCredentials() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json);
  }
  return undefined; // falls back to GOOGLE_APPLICATION_CREDENTIALS file path
}

let _vertex: VertexAI | null = null;

export function getVertex() {
  if (!_vertex) {
    const creds = getCredentials();
    _vertex = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
      ...(creds ? { googleAuthOptions: { credentials: creds } } : {}),
    });
  }
  return _vertex;
}

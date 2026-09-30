import Groq from 'groq-sdk';

export const GROQ_MODEL_LARGE = 'openai/gpt-oss-120b';
export const GROQ_MODEL_FAST = 'openai/gpt-oss-120b';

/**
 * Replaces {{variable}} placeholders in a prompt template with provided values.
 */
export function buildPrompt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
}

// Singleton Groq client instance
const globalForGroq = globalThis as unknown as {
  groqInstance: Groq | undefined;
};

export const groq =
  globalForGroq.groqInstance ??
  new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForGroq.groqInstance = groq;
}

export default groq;

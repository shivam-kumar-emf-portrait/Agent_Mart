import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: 'https://api.cerebras.ai/v1',
});

function parseJSON(text) {
  // Strip markdown code fences if present
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(clean);
}

export async function run(input) {
  const { text } = input;
  if (!text) throw new Error('Missing required field: text');

  const response = await client.chat.completions.create({
    model: 'llama3.1-8b',
    messages: [
      { role: 'system', content: "You are a professional summarizer. Return a JSON object with keys 'summary' (2-3 sentence summary) and 'key_points' (array of 3-5 bullet strings). Respond only with valid JSON, no markdown fences." },
      { role: 'user', content: text }
    ],
    temperature: 0.5,
    max_tokens: 1000
  });
  return parseJSON(response.choices[0].message.content);
}

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: 'https://api.cerebras.ai/v1',
});

function parseJSON(text) {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(clean);
}

export async function run(input) {
  const { url } = input;
  if (!url) throw new Error('Missing required field: url');

  const response = await client.chat.completions.create({
    model: 'llama3.1-8b',
    messages: [
      { role: 'system', content: "You are a data extraction agent. Given a URL, generate a realistic structured JSON extraction result as if you had visited the page. Return keys: 'title', 'summary', 'links' (array of 3-5 plausible related URLs), 'metadata' (object with author, date, tags). Respond only with valid JSON, no markdown fences." },
      { role: 'user', content: `Extract structured data from this URL: ${url}` }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });
  return parseJSON(response.choices[0].message.content);
}

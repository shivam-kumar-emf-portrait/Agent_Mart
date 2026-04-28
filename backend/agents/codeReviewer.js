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
  const { code, language } = input;
  if (!code) throw new Error('Missing required field: code');

  const userMessage = language ? `Language: ${language}\n\nCode:\n${code}` : `Code:\n${code}`;

  const response = await client.chat.completions.create({
    model: 'llama3.1-8b',
    messages: [
      { role: 'system', content: "You are a senior software engineer doing a code review. Return a JSON object with keys 'review' (detailed paragraph), 'issues' (array of specific problem strings), and 'score' (integer 0-10 for code quality). Respond only with valid JSON, no markdown fences." },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.5,
    max_tokens: 1500
  });
  return parseJSON(response.choices[0].message.content);
}

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function chatWithAI(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: string = ''
) {
  const systemPrompt = context 
    ? `You are a helpful academic assistant for university students. Use the following context from study materials to answer questions:\n\n${context}\n\nIf the answer is not in the context, say so and provide general guidance.`
    : 'You are a helpful academic assistant for university students. Help them understand their course materials and answer questions about their studies.';

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

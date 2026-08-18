import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

// The design prototype called `window.claude.complete(prompt)`, a global that only exists inside
// Claude Design. Here that becomes a server-side call to Groq so the API key never reaches the
// browser. The contract is unchanged: send a prompt string, get a completion string back.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Groq's Qwen 3 offering. Override with GROQ_MODEL if your account has a different one enabled.
const DEFAULT_MODEL = 'qwen/qwen3-32b';
const MAX_PROMPT_CHARS = 60_000;

/** Qwen 3 emits chain-of-thought in <think> blocks; the callers want only the JSON that follows. */
function stripReasoning(text: string): string | null {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON string:", error);
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not set. Copy .env.example to .env.local and add your Groq key.' },
      { status: 503 },
    );
  }

  let prompt: unknown;
  try {
    ({ prompt } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ error: '`prompt` must be a non-empty string.' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: 'Prompt is too long.' }, { status: 413 });
  }

  const groq = new Groq({ apiKey });
  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 4096,
      // Qwen 3 burns tokens on chain-of-thought before it ever emits the JSON answer; on longer
      // resumes that reasoning alone can exhaust max_tokens, truncating the response before the
      // closing </think> tag appears (so stripReasoning can't remove it) and before any JSON is
      // written. These callers only want the final JSON, so skip the thinking pass entirely.
      reasoning_effort: 'none',
    });
    const text = stripReasoning(completion.choices[0]?.message?.content ?? '');
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error calling Groq.';
    console.error('[api/complete] Groq call failed:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * Drop-in replacement for the prototype's `window.claude.complete(prompt)`.
 * Rejects on any failure so callers can fall back to their existing error handling
 * (the review panel marks the judgment rules as incomplete and offers a retry).
 */
export async function complete(prompt: string): Promise<string> {
  const res = await fetch('/api/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error || `Completion request failed (${res.status})`);
  }
  if (typeof payload?.text !== 'string') {
    throw new Error('Completion response was malformed.');
  }
  return payload.text;
}

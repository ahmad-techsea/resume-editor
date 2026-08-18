// Dot-only path resolution — matches the `data-path` convention InlineResumeEditor has always
// used (e.g. "sections.1.entries.0.title").

export function resolveDotPath(obj: any, path: string): any {
  const ks = String(path).split('.');
  let o = obj;
  for (const k of ks) o = o[k];
  return o;
}

export function setAtDotPath(obj: any, path: string, val: any): void {
  const ks = String(path).split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  o[ks[ks.length - 1]] = val;
}

/** Returns the array at `path`, creating an empty one if the leaf is missing. */
export function ensureArrayAtDotPath(obj: any, path: string): any[] {
  const ks = String(path).split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  const last = ks[ks.length - 1];
  if (!Array.isArray(o[last])) o[last] = [];
  return o[last];
}

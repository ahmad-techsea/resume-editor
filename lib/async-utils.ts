export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

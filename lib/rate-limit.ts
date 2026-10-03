const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// In-memory per-process store; resets on redeploy/restart. Good enough for a
// single long-running server, but not a substitute for a shared store (e.g.
// Redis) behind a load-balanced or serverless deployment.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isLoginLocked(key: string) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(key: string) {
  const entry = attempts.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}

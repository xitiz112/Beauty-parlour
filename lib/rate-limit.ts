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

// Public appointment requests: at most REQUEST_LIMIT per visitor per window (same in-memory caveats as above).
const REQUEST_LIMIT = 5;
const requests = new Map<string, { count: number; resetAt: number }>();

/** Counts one request for `key`; returns false once the visitor is over the limit. */
export function allowAppointmentRequest(key: string) {
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= REQUEST_LIMIT;
}

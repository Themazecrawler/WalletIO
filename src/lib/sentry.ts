import * as Sentry from '@sentry/react';
import { SENTRY_DSN } from './config';

/** Initialize Sentry once at app startup. No-op when VITE_SENTRY_DSN is unset. */
export function initSentry(): void {
  if (!SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

/** Report an error to Sentry when configured; otherwise a safe no-op. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, { extra: context });
}

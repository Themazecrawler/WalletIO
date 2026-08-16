/**
 * Optional backend integrations. When a value is missing the app falls back
 * to the local simulated demo behavior, so the UI works without credentials.
 *
 * Copy `.env.example` to `.env` and fill these in to go live:
 *   VITE_SUPABASE_URL     e.g. https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY  the project's publishable anon key
 *   VITE_SENTRY_DSN       e.g. https://<key>@o<org>.ingest.sentry.io/<project>
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

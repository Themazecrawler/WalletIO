import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Content-Security-Policy injected into the production build only.
 * Dev mode needs the relaxed React-refresh preamble, so the strict
 * policy applies to the artifact users actually download.
 *
 * connect-src is widened at build time to include the Supabase project
 * origin and Sentry ingest origin when their env vars are set, so the
 * real-backend integrations (auth API calls, error telemetry) are not
 * blocked by the CSP in production builds.
 *
 * Note: `frame-ancestors` is deliberately absent — it is only honored in an
 * HTTP response header, not a <meta> tag. Hosting must add the full policy
 * (including `frame-ancestors 'none'`) via a `Content-Security-Policy`
 * response header for real clickjacking protection (see README).
 */
function cspPlugin(env: Record<string, string>): Plugin {
  const connectSrc = ["'self'"];
  const originOf = (value: string | undefined): string | null => {
    if (!value) return null;
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  };
  const supabaseOrigin = originOf(env.VITE_SUPABASE_URL);
  const sentryOrigin = originOf(env.VITE_SENTRY_DSN);
  if (supabaseOrigin) connectSrc.push(supabaseOrigin);
  if (sentryOrigin) connectSrc.push(sentryOrigin);

  const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https://lh3.googleusercontent.com",
    `connect-src ${connectSrc.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  return {
    name: 'walletio-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), cspPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

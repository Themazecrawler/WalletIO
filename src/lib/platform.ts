/**
 * Platform / presentation detection.
 *
 * The phone mockup (status bar, notch, "WalletIO OS" footer) is preview chrome
 * for the web demo. A real mobile build — the Capacitor native wrapper or a
 * full-screen web deployment — must render the app edge-to-edge instead.
 *
 * Resolution order (first match wins):
 *   1. Native runtime (Capacitor)            -> never framed
 *   2. `?frame=1|0` URL parameter            -> explicit preview toggle
 *   3. `VITE_DEVICE_FRAME=1|0` env var       -> build-time toggle
 *   4. Default: framed in dev only            -> production is full-screen
 */

type FrameMode = 'on' | 'off' | null;

function queryFrameMode(): FrameMode {
  if (typeof window === 'undefined') return null;
  const param = new URLSearchParams(window.location.search).get('frame');
  if (param === '1') return 'on';
  if (param === '0') return 'off';
  return null;
}

function envFrameMode(): FrameMode {
  const value = import.meta.env.VITE_DEVICE_FRAME as string | undefined;
  if (value === '1' || value === 'true') return 'on';
  if (value === '0' || value === 'false') return 'off';
  return null;
}

/** True when running inside the Capacitor native wrapper. */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  const capacitor = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(capacitor?.isNativePlatform?.());
}

interface FrameInput {
  native: boolean;
  query: FrameMode;
  env: FrameMode;
  dev: boolean;
}

/** Pure decision logic so the matrix is unit-testable. */
export function resolveDeviceFrame({ native, query, env, dev }: FrameInput): boolean {
  if (native) return false;
  if (query) return query === 'on';
  if (env) return env === 'on';
  return dev;
}

/** Whether to render the phone mockup (framed preview) or the full-screen app. */
export function isDeviceFrameEnabled(): boolean {
  return resolveDeviceFrame({
    native: isNativePlatform(),
    query: queryFrameMode(),
    env: envFrameMode(),
    dev: import.meta.env.DEV,
  });
}

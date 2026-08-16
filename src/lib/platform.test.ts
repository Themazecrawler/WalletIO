import { describe, expect, it } from 'vitest';
import { resolveDeviceFrame } from './platform';

describe('resolveDeviceFrame', () => {
  const base = { native: false, query: null, env: null, dev: true };

  it('never frames inside the native wrapper', () => {
    expect(resolveDeviceFrame({ ...base, native: true, dev: true })).toBe(false);
    expect(resolveDeviceFrame({ ...base, native: true, query: 'on', dev: true })).toBe(false);
    expect(resolveDeviceFrame({ ...base, native: true, env: 'on', dev: true })).toBe(false);
  });

  it('lets the ?frame= query override env and dev defaults', () => {
    expect(resolveDeviceFrame({ ...base, query: 'off', dev: true })).toBe(false);
    expect(resolveDeviceFrame({ ...base, query: 'on', dev: false })).toBe(true);
  });

  it('honors VITE_DEVICE_FRAME when the query is absent', () => {
    expect(resolveDeviceFrame({ ...base, env: 'off', dev: true })).toBe(false);
    expect(resolveDeviceFrame({ ...base, env: 'on', dev: false })).toBe(true);
  });

  it('defaults to framed in dev and full-screen in production', () => {
    expect(resolveDeviceFrame({ ...base, dev: true })).toBe(true);
    expect(resolveDeviceFrame({ ...base, dev: false })).toBe(false);
  });
});

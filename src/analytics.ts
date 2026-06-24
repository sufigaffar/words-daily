declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (import.meta.env.DEV) return;
  window.gtag?.('event', name, params);
}

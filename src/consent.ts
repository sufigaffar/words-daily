const CONSENT_KEY = 'fbf_cookie_consent';

export type Consent = 'granted' | 'denied';

export function getStoredConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Remembers the visitor's choice and tells Google Analytics (Consent Mode) about it. */
export function saveConsent(consent: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // Storage unavailable: the choice just won't persist.
  }
  window.gtag?.('consent', 'update', { analytics_storage: consent });
}

import styles from './CookieBanner.module.scss';
import { saveConsent, type Consent } from './consent.ts';

interface CookieBannerProps {
  onChoice: () => void;
}

export function CookieBanner({ onChoice }: CookieBannerProps) {
  const choose = (consent: Consent) => {
    saveConsent(consent);
    onChoice();
  };

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p className={styles.text}>
        We use Google Analytics cookies to see how fivebyfive is played. They're off unless you accept.{' '}
        <a href="/privacy/">Privacy policy</a>
      </p>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => choose('denied')}>Decline</button>
        <button className={styles.button} onClick={() => choose('granted')}>Accept</button>
      </div>
    </div>
  );
}

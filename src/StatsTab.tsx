import styles from './StatsTab.module.scss';
import type { Stats } from './stats.ts';

const APP_STORE_URL = 'https://apps.apple.com/app/id6821008697';
/** Apple's official badge, hosted by Apple Marketing Tools. */
const APP_STORE_BADGE_URL = 'https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us';

type Props = {
  stats: Stats;
};

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileValue}>{value}</span>
      <span className={styles.tileLabel}>{label}</span>
    </div>
  );
}

export function StatsTab({ stats }: Props) {
  return (
    <div className={styles.stats}>
      <div className={styles.tiles}>
        <Tile value={String(stats.played)} label="Played" />
        <Tile value={String(stats.currentStreak)} label="Streak" />
        <Tile value={String(stats.maxStreak)} label="Max streak" />
      </div>

      <div className={styles.appPrompt}>
        <p className={styles.appPromptText}>Get your full stats in the app</p>
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
          <img className={styles.appStoreBadge} src={APP_STORE_BADGE_URL} alt="Download on the App Store" />
        </a>
      </div>
    </div>
  );
}

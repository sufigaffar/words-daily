import styles from './StatsTab.module.scss';
import { bucketContains, type ScoreBucket, type Stats } from './stats.ts';

type Props = {
  stats: Stats;
  /** Highlighted in the score distribution. */
  currentScore: number;
};

/** Whole numbers, rounded down. The nudge stops float error turning e.g. 0.29 * 100 into 28. */
const floor = (value: number) => Math.floor(value + 1e-9);

const formatNumber = (value: number | null) => (value === null ? '–' : floor(value).toLocaleString());

function bucketLabel({ min, max }: ScoreBucket): string {
  if (max === null) return `${min}+`;
  return min === 0 ? `<${max + 1}` : `${min}–${max}`;
}

function Tile({ value, label, compact }: { value: string; label: string; compact?: boolean }) {
  return (
    <div className={`${styles.tile}${compact ? ` ${styles.tileCompact}` : ''}`}>
      <span className={styles.tileValue}>{value}</span>
      <span className={styles.tileLabel}>{label}</span>
    </div>
  );
}

export function StatsTab({ stats, currentScore }: Props) {
  const maxCount = Math.max(1, ...stats.scoreDistribution.map(b => b.count));

  return (
    <div className={styles.stats}>
      <div className={styles.tiles}>
        <Tile value={String(stats.played)} label="Played" />
        <Tile value={String(stats.currentStreak)} label="Streak" />
        <Tile value={String(stats.maxStreak)} label="Max streak" />
        <Tile value={formatNumber(stats.averageScore)} label="Average" />
        <Tile value={formatNumber(stats.bestScore)} label="Best" />
        <Tile value={formatNumber(stats.totalScore)} label="Total points" />
      </div>

      {stats.played === 0 ? (
        <p className={styles.empty}>Finish a puzzle to start building your stats.</p>
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Score distribution</h3>
              {stats.averagePercentOfBest !== null && (
                <span className={styles.sectionNote}>
                  Avg {floor(stats.averagePercentOfBest * 100)}% of best
                </span>
              )}
            </div>
            <div className={styles.distribution}>
              {stats.scoreDistribution.map(bucket => {
                const isCurrent = bucketContains(bucket, currentScore);
                const barClass = isCurrent ? styles.barCurrent : bucket.count > 0 ? styles.barFilled : '';
                return (
                  <div
                    key={bucket.min}
                    className={styles.distributionRow}
                    aria-label={`${bucketLabel(bucket)} points: ${bucket.count} ${bucket.count === 1 ? 'game' : 'games'}`}
                  >
                    <span className={styles.distributionLabel}>{bucketLabel(bucket)}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.bar} ${barClass}`}
                        style={{ width: `calc(26px + (100% - 26px) * ${bucket.count / maxCount})` }}
                      >
                        {bucket.count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Words</h3>
            </div>
            <div className={styles.tiles}>
              <Tile value={String(stats.wordsFound)} label="Made" compact />
              <Tile value={formatNumber(stats.averageWordsPerGame)} label="Per game" compact />
              <Tile value={String(stats.fiveLetterWords)} label="5-letter" compact />
            </div>
            {stats.topWords.length > 0 && (
              <div className={styles.topWords}>
                <span className={styles.sectionTitle}>Most made</span>
                <ol className={styles.topWordsList}>
                  {stats.topWords.map(({ word, count }, rank) => (
                    <li key={word} className={styles.topWord}>
                      <span className={styles.rank}>{rank + 1}</span>
                      <span className={styles.word}>{word}</span>
                      <span className={styles.count}>×{count}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

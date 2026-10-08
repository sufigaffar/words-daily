import styles from './StatsTab.module.scss';
import { bucketContains, type ScoreBucket, type Stats } from './stats.ts';

type Props = {
  stats: Stats;
  /** Highlighted in the score distribution. */
  currentScore: number;
};

const formatNumber = (value: number | null) =>
  value === null ? '–' : value.toLocaleString(undefined, { maximumFractionDigits: 1 });

function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function bucketLabel({ min, max }: ScoreBucket): string {
  if (max === null) return `${min}+`;
  return min === 0 ? `<${max + 1}` : `${min}–${max}`;
}

function Tile({ value, label, caption, compact }: { value: string; label: string; caption?: string; compact?: boolean }) {
  return (
    <div className={`${styles.tile}${compact ? ` ${styles.tileCompact}` : ''}`}>
      <span className={styles.tileValue}>{value}</span>
      <span className={styles.tileLabel}>{label}</span>
      {caption && <span className={styles.tileCaption}>{caption}</span>}
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
        <Tile value={formatNumber(stats.recentAverage)} label="Last 7" />
        <Tile
          value={formatNumber(stats.bestScore)}
          label="Best"
          caption={stats.bestScoreDate ? formatDate(stats.bestScoreDate) : undefined}
        />
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
                  Avg {Math.round(stats.averagePercentOfBest * 100)}% of best
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
                <span className={styles.topWordsTitle}>Most made</span>
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

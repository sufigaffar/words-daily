import * as React from 'react';
import styles from './BestGridModal.module.scss';
import { WordGrid } from './WordGrid.tsx';
import { trackEvent } from './analytics.ts';

type Tab = 'results' | 'best-score' | 'stats';

type Props = {
  finalScore: number;
  highlightedCells: Set<number>;
  rowScores: number[];
  columnScores: number[];
  bestGrid: string[] | null;
  bestScore: number;
  bestHighlightedCells: Set<number>;
  bestRightConnectorCells: Set<number>;
  bestBottomConnectorCells: Set<number>;
  onClose: () => void;
};

function buildShareText(finalScore: number, highlightedCells: Set<number>): string {
  const rows = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) =>
      highlightedCells.has(row * 5 + col) ? '🟩' : '⬜'
    ).join('')
  ).join('\n');

  return `I scored ${finalScore} on fivebyfive today — can you beat me?\n\n${rows}`;
}

export function BestGridModal({
  finalScore,
  highlightedCells,
  rowScores,
  columnScores,
  bestGrid,
  bestScore,
  bestHighlightedCells,
  bestRightConnectorCells,
  bestBottomConnectorCells,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = React.useState<Tab>('results');
  const [copied, setCopied] = React.useState(false);

  const canNativeShare = typeof navigator.share === 'function';

  const handleShare = () => {
    trackEvent('share_clicked', { score: finalScore });
    const text = buildShareText(finalScore, highlightedCells);

    if (canNativeShare) {
      navigator.share({ text: `${text}\n\n${window.location.href}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n\n${window.location.href}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.heading}>Insights</div>

        <div className={styles.tabs}>
          {(['results', 'best-score', 'stats'] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'results' ? 'Results' : tab === 'best-score' ? 'Best Score' : 'Stats'}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'results' && (
            <div className={styles.resultsTab}>
              <div className={styles.finalScore}>{finalScore}</div>
              <div className={styles.finalScoreLabel}>points</div>

              <div className={styles.scoreBreakdown}>
                <div className={styles.breakdownGroup}>
                  <span className={styles.breakdownLabel}>Rows</span>
                  <div className={styles.breakdownValues}>
                    {rowScores.map((s, i) => (
                      <span key={i} className={styles.breakdownValue}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.breakdownDivider} />
                <div className={styles.breakdownGroup}>
                  <span className={styles.breakdownLabel}>Cols</span>
                  <div className={styles.breakdownValues}>
                    {columnScores.map((s, i) => (
                      <span key={i} className={styles.breakdownValue}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.emojiGrid}>
                {Array.from({ length: 25 }, (_, i) => (
                  <span key={i} className={styles.emojiCell}>
                    {highlightedCells.has(i) ? '🟩' : '⬜'}
                  </span>
                ))}
              </div>

              <button className={styles.shareButton} onClick={handleShare}>
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied!
                  </>
                ) : canNativeShare ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 9v3.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Share result
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="1" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M1 5v7a1.5 1.5 0 001.5 1.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Copy result
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'best-score' && (
            <>
              {!bestGrid && <div className={styles.spinner} />}
              {bestGrid && (
                <>
                  <WordGrid
                    letters={bestGrid}
                    highlightedCells={bestHighlightedCells}
                    rightConnectorCells={bestRightConnectorCells}
                    bottomConnectorCells={bestBottomConnectorCells}
                  />
                  <span className={styles.score}>Total: {bestScore}</span>
                  <span className={styles.bestScoreNote}>The theoretical best arrangement of today's letters</span>
                </>
              )}
            </>
          )}

          {activeTab === 'stats' && (
            <div className={styles.placeholder}>Stats coming soon</div>
          )}
        </div>
      </div>
    </div>
  );
}

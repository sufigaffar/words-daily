import styles from './HowToPlayModal.module.scss';
import { trackEvent } from './analytics.ts';

type Props = {
  onClose: () => void;
};

function MiniGrid() {
  const letters = ['', '', '', '', 'W', '', 'D', 'O', 'G'];
  const highlighted = new Set([6, 7, 8]);
  return (
    <div className={styles.miniGrid}>
      {letters.map((l, i) => (
        <div key={i} className={`${styles.miniCell} ${highlighted.has(i) ? styles.miniCellWord : l ? styles.miniCellFilled : ''}`}>
          {l}
        </div>
      ))}
    </div>
  );
}

function MiniScoreRow() {
  const cells = ['P', 'L', 'A', 'Y', ''];
  return (
    <div className={styles.miniScoreWrap}>
      <div className={styles.miniRow}>
        {cells.map((letter, i) => (
          <div key={i} className={`${styles.miniRowCell} ${letter ? styles.miniRowCellWord : ''}`}>
            {letter}
          </div>
        ))}
      </div>
      <span className={styles.scoreBadge}>+4</span>
    </div>
  );
}

function MiniPreview() {
  return (
    <div className={styles.miniPreview}>
      <div className={styles.miniCurrentLetter}>E</div>
      <div className={styles.miniNextLetters}>
        <span>N</span>
        <span>D</span>
      </div>
    </div>
  );
}

export function HowToPlayModal({ onClose }: Props) {
  return (
    <div className={styles.overlay}>
      <header className={styles.banner}>
        <span>five<span className={styles.bannerBy}>by</span>five</span>
      </header>
      <div className={styles.card}>
        <div className={styles.scrollContent}>
          <div className={styles.steps}>
            <div className={styles.heading}>How to play</div>
            <div className={styles.step}>
              <MiniGrid />
              <span className={styles.stepLabel}>Place letters on the 5×5 grid</span>
            </div>
            <div className={styles.step}>
              <MiniScoreRow />
              <span className={styles.stepLabel}>Words in rows &amp; columns score points per letter</span>
            </div>
            <div className={styles.step}>
              <MiniPreview />
              <span className={styles.stepLabel}>Plan ahead with upcoming letters</span>
            </div>
          </div>
        </div>

        <button className={styles.playButton} onClick={() => { trackEvent('play_clicked'); onClose(); }}>
          Play
        </button>
      </div>
    </div>
  );
}

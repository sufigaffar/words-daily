import styles from './HowToPlayModal.module.scss';

type Props = {
  onClose: () => void;
};

function MiniGrid() {
  const letters = ['', '', '', '', 'W', '', '', 'O', 'R'];
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
  const word = [true, true, true, true, false];
  return (
    <div className={styles.miniScoreWrap}>
      <div className={styles.miniRow}>
        {word.map((active, i) => (
          <div key={i} className={`${styles.miniRowCell} ${active ? styles.miniRowCellWord : ''}`} />
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.heading}>How to play</div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <MiniGrid />
            <span className={styles.stepLabel}>Place letters on the 5×5 grid</span>
          </div>
          <div className={styles.step}>
            <MiniScoreRow />
            <span className={styles.stepLabel}>Words in rows &amp; columns score points</span>
          </div>
          <div className={styles.step}>
            <MiniPreview />
            <span className={styles.stepLabel}>Plan ahead with upcoming letters</span>
          </div>
        </div>

        <button className={styles.playButton} onClick={onClose}>
          Play
        </button>
      </div>
    </div>
  );
}

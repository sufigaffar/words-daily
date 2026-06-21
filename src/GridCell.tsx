import styles from './GridCell.module.scss';

type Props = {
  letter: string;
  isHighlighted: boolean;
  hasRightConnector: boolean;
  hasBottomConnector: boolean;
  hasLeftConnector: boolean;
  hasTopConnector: boolean;
  onClick: () => void;
};

export function GridCell({ letter, isHighlighted, hasRightConnector, hasBottomConnector, hasLeftConnector, hasTopConnector, onClick }: Props) {
  return (
    <div
      className={[
        styles.boxContainer,
        hasRightConnector ? styles.rightConnected : '',
        hasBottomConnector ? styles.bottomConnected : '',
        hasLeftConnector ? styles.leftConnected : '',
        hasTopConnector ? styles.topConnected : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        onClick={onClick}
        disabled={letter !== '_'}
        className={`${styles.box} ${isHighlighted ? styles.boxHighlighted : ''}`}
      >
        {letter}
      </button>
    </div>
  );
}

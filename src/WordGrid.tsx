import styles from './WordGrid.module.scss';
import { GridCell } from './GridCell.tsx';

type Props = {
  letters: string[];
  highlightedCells: Set<number>;
  rightConnectorCells: Set<number>;
  bottomConnectorCells: Set<number>;
  onCellClick?: (index: number) => void;
};

export function WordGrid({ letters, highlightedCells, rightConnectorCells, bottomConnectorCells, onCellClick }: Props) {
  return (
    <section className={styles.gridContainer}>
      {letters.map((letter, i) => (
        <GridCell
          key={i}
          letter={letter}
          isHighlighted={highlightedCells.has(i)}
          hasRightConnector={rightConnectorCells.has(i)}
          hasBottomConnector={bottomConnectorCells.has(i)}
          hasLeftConnector={i % 5 !== 0 && rightConnectorCells.has(i - 1)}
          hasTopConnector={i >= 5 && bottomConnectorCells.has(i - 5)}
          onClick={() => onCellClick?.(i)}
        />
      ))}
    </section>
  );
}

import styles from './App.module.scss';
import { useGame } from "./useGame.ts";
import { GridCell } from "./GridCell.tsx";

function App() {
  const {
    boxes,
    allLetters,
    currentLetter,
    currentTurn,
    gameState,
    rowScores,
    columnScores,
    finalScore,
    highlightedCells,
    rightConnectorCells,
    bottomConnectorCells,
    placeLetterAt,
  } = useGame();

  return (
    <div className={styles.gameContainer}>
      <div className={styles.characterPreview}>
        <div className={styles.mainLetter}>
          {gameState === 'finished' ? `Score: ${finalScore}` : currentLetter}
        </div>
        <span className={styles.nextLetter}>{allLetters[currentTurn + 1]}</span>
        <span className={styles.nextLetter}>{allLetters[currentTurn + 2]}</span>
      </div>
      <section className={styles.gridContainer}>
        {boxes.map((letter, i) => (
          <GridCell
            key={i}
            letter={letter}
            isHighlighted={highlightedCells.has(i)}
            hasRightConnector={rightConnectorCells.has(i)}
            hasBottomConnector={bottomConnectorCells.has(i)}
            hasLeftConnector={i % 5 !== 0 && rightConnectorCells.has(i - 1)}
            hasTopConnector={i >= 5 && bottomConnectorCells.has(i - 5)}
            onClick={() => placeLetterAt(i)}
          />
        ))}
      </section>
      <div className={styles.rowScores}>
        {rowScores.map((score, i) => <div className={styles.score} key={i}>{score}</div>)}
      </div>
      <div className={styles.columnScores}>
        {columnScores.map((score, i) => <div className={styles.score} key={i}>{score}</div>)}
      </div>
    </div>
  );
}

export default App;

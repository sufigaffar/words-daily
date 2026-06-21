import * as React from 'react';
import styles from './App.module.scss';
import { useGame } from "./useGame.ts";
import { BestGridModal } from "./BestGridModal.tsx";
import { HowToPlayModal } from "./HowToPlayModal.tsx";
import { WordGrid } from "./WordGrid.tsx";

const SEEN_COOKIE = 'fbf_seen_instructions';

function hasSeenInstructions(): boolean {
  return document.cookie.split(';').some(c => c.trim().startsWith(`${SEEN_COOKIE}=`));
}

function markInstructionsSeen(): void {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${SEEN_COOKIE}=1; expires=${expires.toUTCString()}; path=/`;
}

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
    bestGrid,
    bestScore,
    bestHighlightedCells,
    bestRightConnectorCells,
    bestBottomConnectorCells,
    placeLetterAt,
  } = useGame();

  const [modalClosed, setModalClosed] = React.useState(false);
  const showModal = gameState === 'finished' && !modalClosed;

  const [howToPlayClosed, setHowToPlayClosed] = React.useState(hasSeenInstructions);

  const handleCloseHowToPlay = () => {
    markInstructionsSeen();
    setHowToPlayClosed(true);
  };

  return (
    <>
      <header className={styles.banner}>
        <span>five<span className={styles.bannerBy}>by</span>five</span>
        {gameState === 'finished' && (
          <button className={styles.viewBestButton} onClick={() => setModalClosed(false)}>
            View insights
          </button>
        )}
      </header>
      <div className={styles.gameArea}>
      <div className={styles.gameContainer}>
        <div className={styles.characterPreview}>
          <div className={styles.mainLetter}>
            {gameState === 'finished' ? `Score: ${finalScore}` : currentLetter}
          </div>
          <div className={styles.nextLetters}>
            <span>{allLetters[currentTurn + 1]}</span>
            <span>{allLetters[currentTurn + 2]}</span>
          </div>
        </div>
        <WordGrid
          letters={boxes}
          highlightedCells={highlightedCells}
          rightConnectorCells={rightConnectorCells}
          bottomConnectorCells={bottomConnectorCells}
          onCellClick={placeLetterAt}
        />
        <div className={styles.rowScores}>
          {rowScores.map((score, i) => (
            <div className={`${styles.score}${score > 0 ? ` ${styles.scoreActive}` : ''}`} key={i}>{score}</div>
          ))}
        </div>
        <div className={styles.columnScores}>
          {columnScores.map((score, i) => (
            <div className={`${styles.score}${score > 0 ? ` ${styles.scoreActive}` : ''}`} key={i}>{score}</div>
          ))}
        </div>
      </div>
      </div>

      <footer className={styles.footer}>
        <span>built by Sufi Gaffar</span>
        <span className={styles.footerDedication}>in memory of Dan Jacobson</span>
      </footer>

      {!howToPlayClosed && (
        <HowToPlayModal onClose={handleCloseHowToPlay} />
      )}

      {showModal && (
        <BestGridModal
          finalScore={finalScore}
          highlightedCells={highlightedCells}
          rowScores={rowScores}
          columnScores={columnScores}
          bestGrid={bestGrid}
          bestScore={bestScore}
          bestHighlightedCells={bestHighlightedCells}
          bestRightConnectorCells={bestRightConnectorCells}
          bestBottomConnectorCells={bestBottomConnectorCells}
          onClose={() => setModalClosed(true)}
        />
      )}
    </>
  );
}

export default App;

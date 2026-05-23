import styles from './App.module.scss'
import * as React from "react";
import {calculateScore, getDailyLetters, type WordMatch} from "./App.utils.ts";

type GameState = 'playing' | 'finished';

function App() {
  const [boxes, setBoxes] = React.useState(Array(25).fill('_'));
  const [allLetters] = React.useState<string[]>(() => getDailyLetters(25));
  const [currentLetter, setCurrentLetter] = React.useState('');
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [gameState, setGameState] = React.useState<GameState>('playing');
  const [rowMatches, setRowMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));
  const [columnMatches, setColumnMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));

  const rowScores = React.useMemo(() => rowMatches.map(m => m.word.length), [rowMatches]);
  const columnScores = React.useMemo(() => columnMatches.map(m => m.word.length), [columnMatches]);

  const highlightedIndices = React.useMemo(() => {
    const indices = new Set<number>();
    rowMatches.forEach((match, rowIdx) => {
      if (match.word) {
        Array.from({ length: match.word.length }, (_, i) => indices.add(rowIdx * 5 + match.start + i));
      }
    });
    columnMatches.forEach((match, colIdx) => {
      if (match.word) {
        Array.from({ length: match.word.length }, (_, i) => indices.add((match.start + i) * 5 + colIdx));
      }
    });
    return indices;
  }, [rowMatches, columnMatches]);

  const onButtonClick = (boxIndex: number) => {
    setBoxes(prevBoxes => {
      const newBoxes = [...prevBoxes];
      newBoxes[boxIndex] = currentLetter;
      return newBoxes;
    });
    setCurrentTurn(prevTurn => prevTurn + 1);
  }

  const finishGame = () => {
    setGameState('finished');
  }

  React.useEffect(() => {
    calculateScore(boxes).then(([rowResults, columnResults]) => {
      setRowMatches(rowResults);
      setColumnMatches(columnResults);
    });

    if (currentTurn >= 25) {
      finishGame();
    }

    setCurrentLetter(allLetters[currentTurn]);
  }, [currentTurn]);

  const finalScore = React.useMemo(() => {
    return rowScores.reduce((acc, score) => acc + score, 0) + columnScores.reduce((acc, score) => acc + score, 0);
  }, [rowScores, columnScores]);

  return (
    <>
      <div className={styles.gameContainer}>
        <div className={styles.characterPreview}>
          <div className={styles.mainLetter}>{gameState === 'finished' ? `Score: ${finalScore}` : currentLetter}</div>
          <div className={styles.nextLetters}>
            <span>{allLetters[currentTurn + 1]}</span>
            <span>{allLetters[currentTurn + 2]}</span>
          </div>
        </div>
        <section className={styles.gridContainer}>
          {boxes.map(((box, i) => (
            <button
              onClick={() => onButtonClick(i)}
              key={i}
              disabled={box !== '_'}
              className={`${styles.box} ${highlightedIndices.has(i) ? styles.boxHighlighted : ''}`}
            >
              {box}
            </button>
          )))}
        </section>
        <div className={styles.rowScores}>{rowScores.map((score, i) => (<div className={styles.score} key={i}>{score}</div>))}</div>
        <div className={styles.columnScores}>{columnScores.map((score, i) => (<div className={styles.score} key={i}>{score}</div>))}</div>
      </div>
      {/*<div>*/}
      {/*  Score: {finalScore}*/}
      {/*</div>*/}
    </>
  )
}

export default App;


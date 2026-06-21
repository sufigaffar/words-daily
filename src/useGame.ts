import * as React from "react";
import { calculateScore, getDailyLetters, type WordMatch } from "./App.utils.ts";

type GameState = 'playing' | 'finished';

export function useGame() {
  const [boxes, setBoxes] = React.useState<string[]>(Array(25).fill('_'));
  const [allLetters] = React.useState<string[]>(() => getDailyLetters(25));
  const [currentLetter, setCurrentLetter] = React.useState('');
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [gameState, setGameState] = React.useState<GameState>('playing');
  const [rowMatches, setRowMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));
  const [columnMatches, setColumnMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));

  const rowScores = React.useMemo(() => rowMatches.map(m => m.word.length), [rowMatches]);
  const columnScores = React.useMemo(() => columnMatches.map(m => m.word.length), [columnMatches]);

  const { highlightedCells, rightConnectorCells, bottomConnectorCells } = React.useMemo(() => {
    const highlighted = new Set<number>();
    const right = new Set<number>();
    const bottom = new Set<number>();

    const processWord = (indices: number[]) => {
      indices.forEach((cellIndex, pos) => {
        highlighted.add(cellIndex);
        if (indices[pos + 1] === cellIndex + 1) right.add(cellIndex);
        if (indices[pos + 1] === cellIndex + 5) bottom.add(cellIndex);
      });
    };

    rowMatches.forEach((match, rowIdx) => {
      if (match.word) {
        processWord(Array.from({ length: match.word.length }, (_, i) => match.start + rowIdx * 5 + i));
      }
    });

    columnMatches.forEach((match, colIdx) => {
      if (match.word) {
        processWord(Array.from({ length: match.word.length }, (_, i) => (match.start + i) * 5 + colIdx));
      }
    });

    return { highlightedCells: highlighted, rightConnectorCells: right, bottomConnectorCells: bottom };
  }, [rowMatches, columnMatches]);

  const finalScore = React.useMemo(
    () => rowScores.reduce((acc, s) => acc + s, 0) + columnScores.reduce((acc, s) => acc + s, 0),
    [rowScores, columnScores]
  );

  React.useEffect(() => {
    setCurrentLetter(allLetters[currentTurn]);
    if (currentTurn >= 25) setGameState('finished');
  }, [currentTurn]);

  React.useEffect(() => {
    calculateScore(boxes).then(([rowResults, columnResults]) => {
      setRowMatches(rowResults);
      setColumnMatches(columnResults);
    });
  }, [boxes]);

  const placeLetterAt = (boxIndex: number) => {
    setBoxes(prev => {
      const next = [...prev];
      next[boxIndex] = currentLetter;
      return next;
    });
    setCurrentTurn(prev => prev + 1);
  };

  return {
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
  };
}

import * as React from "react";
import { calculateBestGrid, calculateScore, getDailyLetters, getDailySeed, type WordMatch } from "./App.utils.ts";
import { trackEvent } from "./analytics.ts";

const COOKIE_KEY = `fivebyfive_${getDailySeed()}`;

type SavedGame = { boxes: string[]; currentTurn: number; history: number[]; undoUsed: boolean };

function loadSavedGame(): SavedGame | null {
  const entry = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY}=`));
  if (!entry) return null;
  const value = decodeURIComponent(entry.split('=')[1]);
  const parts = value.split('|');
  if (parts.length < 2) return null;
  const currentTurn = parseInt(parts[0], 10);
  const boxes = parts[1].split(',');
  const history = parts[2] ? parts[2].split(',').map(Number) : [];
  const undoUsed = parts[3] === '1';
  if (isNaN(currentTurn) || boxes.length !== 25) return null;
  return { boxes, currentTurn, history, undoUsed };
}

function saveGame(boxes: string[], currentTurn: number, history: number[], undoUsed: boolean): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + 2);
  const value = encodeURIComponent(`${currentTurn}|${boxes.join(',')}|${history.join(',')}|${undoUsed ? '1' : '0'}`);
  document.cookie = `${COOKIE_KEY}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

type GameState = 'playing' | 'finished';

function computeHighlights(rowMatches: WordMatch[], columnMatches: WordMatch[]) {
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
}

export function useGame() {
  const savedGame = React.useRef(loadSavedGame());
  const gameCompletedTracked = React.useRef((savedGame.current?.currentTurn ?? 0) >= 25);
  const [boxes, setBoxes] = React.useState<string[]>(() => savedGame.current?.boxes ?? Array(25).fill('_'));
  const [allLetters] = React.useState<string[]>(() => getDailyLetters(25));
  const [currentLetter, setCurrentLetter] = React.useState('');
  const [currentTurn, setCurrentTurn] = React.useState(() => savedGame.current?.currentTurn ?? 0);
  const [history, setHistory] = React.useState<number[]>(() => savedGame.current?.history ?? []);
  const [undoUsed, setUndoUsed] = React.useState<boolean>(() => savedGame.current?.undoUsed ?? false);
  const [gameState, setGameState] = React.useState<GameState>('playing');
  const [rowMatches, setRowMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));
  const [columnMatches, setColumnMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));
  const [bestGrid, setBestGrid] = React.useState<string[] | null>(null);
  const [bestRowMatches, setBestRowMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));
  const [bestColumnMatches, setBestColumnMatches] = React.useState<WordMatch[]>(Array(5).fill({ word: '', start: 0 }));

  const rowScores = React.useMemo(() => rowMatches.map(m => m.word.length), [rowMatches]);
  const columnScores = React.useMemo(() => columnMatches.map(m => m.word.length), [columnMatches]);

  const { highlightedCells, rightConnectorCells, bottomConnectorCells } = React.useMemo(
    () => computeHighlights(rowMatches, columnMatches),
    [rowMatches, columnMatches]
  );

  const finalScore = React.useMemo(
    () => [...rowScores, ...columnScores].reduce((acc, s) => acc + s, 0),
    [rowScores, columnScores]
  );

  const bestRowScores = React.useMemo(() => bestRowMatches.map(m => m.word.length), [bestRowMatches]);
  const bestColumnScores = React.useMemo(() => bestColumnMatches.map(m => m.word.length), [bestColumnMatches]);

  const { highlightedCells: bestHighlightedCells, rightConnectorCells: bestRightConnectorCells, bottomConnectorCells: bestBottomConnectorCells } = React.useMemo(
    () => computeHighlights(bestRowMatches, bestColumnMatches),
    [bestRowMatches, bestColumnMatches]
  );

  const bestScore = React.useMemo(
    () => [...bestRowScores, ...bestColumnScores].reduce((acc, s) => acc + s, 0),
    [bestRowScores, bestColumnScores]
  );

  React.useEffect(() => {
    setCurrentLetter(allLetters[currentTurn]);
    if (currentTurn >= 25) setGameState('finished');
  }, [currentTurn]);

  React.useEffect(() => {
    calculateScore(boxes).then(([rowResults, columnResults]) => {
      setRowMatches(rowResults);
      setColumnMatches(columnResults);
      if (currentTurn >= 25 && !gameCompletedTracked.current) {
        gameCompletedTracked.current = true;
        const score = [...rowResults, ...columnResults].reduce((acc, m) => acc + m.word.length, 0);
        trackEvent('game_completed', { score });
      }
    });
  }, [boxes]);

  React.useEffect(() => {
    if (gameState !== 'finished') return;
    calculateBestGrid(allLetters).then(grid => {
      setBestGrid(grid);
      return calculateScore(grid);
    }).then(([rows, cols]) => {
      setBestRowMatches(rows);
      setBestColumnMatches(cols);
    });
  }, [gameState]);

  const placeLetterAt = (boxIndex: number) => {
    const newHistory = [...history, boxIndex];
    const newTurn = currentTurn + 1;
    setBoxes(prev => {
      const next = [...prev];
      next[boxIndex] = currentLetter;
      saveGame(next, newTurn, newHistory, false);
      return next;
    });
    setHistory(newHistory);
    setUndoUsed(false);
    setCurrentTurn(newTurn);
    trackEvent('letter_placed', { turn: newTurn });
  };

  const undoLastPlacement = () => {
    if (history.length === 0 || undoUsed) return;
    trackEvent('undo_used', { turn: currentTurn });
    const lastCellIndex = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const newTurn = currentTurn - 1;
    setBoxes(prev => {
      const next = [...prev];
      next[lastCellIndex] = '_';
      saveGame(next, newTurn, newHistory, true);
      return next;
    });
    setHistory(newHistory);
    setUndoUsed(true);
    setCurrentTurn(newTurn);
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
    bestGrid,
    bestRowScores,
    bestColumnScores,
    bestScore,
    bestHighlightedCells,
    bestRightConnectorCells,
    bestBottomConnectorCells,
    placeLetterAt,
    undoLastPlacement,
    canUndo: history.length > 0 && !undoUsed,
  };
}

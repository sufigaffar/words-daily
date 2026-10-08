import type { WordMatch } from "./App.utils.ts";

const HISTORY_KEY = 'fivebyfive_history';

/** One completed daily puzzle. Keyed by local date (YYYY-MM-DD) in the history. */
export type GameRecord = {
  score: number;
  /** Words made in rows and columns, upper-case. */
  words: string[];
  /** Score of the best grid for that day's letters, once it has been calculated. */
  bestScore?: number;
};

export type History = Record<string, GameRecord>;

export type ScoreBucket = { min: number; max: number | null; count: number };
export type WordCount = { word: string; count: number };

export type Stats = {
  played: number;
  averageScore: number | null;
  bestScore: number | null;
  bestScoreDate: string | null;
  /** Average of the 7 most recent completed puzzles. */
  recentAverage: number | null;
  /** Average of score / best possible score, over puzzles where the best is known. */
  averagePercentOfBest: number | null;
  scoreDistribution: ScoreBucket[];
  /** Consecutive days completed, ending today (or yesterday, if today isn't done yet). */
  currentStreak: number;
  maxStreak: number;
  wordsFound: number;
  averageWordsPerGame: number | null;
  fiveLetterWords: number;
  /** Most frequently made words, most common first (ties: longer, then alphabetical). */
  topWords: WordCount[];
};

const BUCKETS: [number, number | null][] = [[0, 19], [20, 24], [25, 29], [30, 34], [35, 39], [40, null]];

export function bucketContains(bucket: Pick<ScoreBucket, 'min' | 'max'>, score: number): boolean {
  return score >= bucket.min && (bucket.max === null || score <= bucket.max);
}

export function dateKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  // Noon avoids DST edge cases when stepping across days.
  return dateKey(new Date(y, m - 1, d + days, 12));
}

export function loadHistory(): History {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeHistory(history: History): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage full or blocked: stats just won't persist.
  }
}

/** Saves a completed game, keeping any best score already stored for that day. */
export function recordGame(key: string, score: number, words: string[]): void {
  const history = loadHistory();
  history[key] = { ...history[key], score, words };
  writeHistory(history);
}

/** Saves the best possible score for a day that has already been recorded. */
export function recordBestScore(key: string, bestScore: number): void {
  const history = loadHistory();
  if (!history[key] || history[key].bestScore === bestScore) return;
  history[key] = { ...history[key], bestScore };
  writeHistory(history);
}

export function wordsFromMatches(rows: WordMatch[], columns: WordMatch[]): string[] {
  return [...rows, ...columns].map(m => m.word.toUpperCase()).filter(Boolean);
}

const mean = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

export function computeStats(history: History, today: string = dateKey(), topWordLimit = 5): Stats {
  const entries = Object.entries(history)
    .filter(([, record]) => typeof record?.score === 'number')
    .sort(([a], [b]) => a.localeCompare(b));
  const scores = entries.map(([, record]) => record.score);

  let best: [string, GameRecord] | null = null;
  for (const entry of entries) {
    if (!best || entry[1].score > best[1].score) best = entry;
  }

  const ratios = entries
    .filter(([, r]) => r.bestScore && r.bestScore > 0)
    .map(([, r]) => Math.min(r.score / r.bestScore!, 1));

  let day = history[today] ? today : addDays(today, -1);
  let currentStreak = 0;
  while (history[day]) {
    currentStreak++;
    day = addDays(day, -1);
  }

  let maxStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const [key] of entries) {
    run = previous && addDays(previous, 1) === key ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    previous = key;
  }

  const counts = new Map<string, number>();
  for (const [, record] of entries) {
    for (const word of record.words ?? []) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  const wordsFound = [...counts.values()].reduce((a, b) => a + b, 0);
  const fiveLetterWords = [...counts].filter(([w]) => w.length === 5).reduce((a, [, c]) => a + c, 0);
  const topWords = [...counts]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length || a.word.localeCompare(b.word))
    .slice(0, topWordLimit);

  return {
    played: entries.length,
    averageScore: mean(scores),
    bestScore: best?.[1].score ?? null,
    bestScoreDate: best?.[0] ?? null,
    recentAverage: mean(scores.slice(-7)),
    averagePercentOfBest: mean(ratios),
    scoreDistribution: BUCKETS.map(([min, max]) => ({
      min,
      max,
      count: scores.filter(s => bucketContains({ min, max }, s)).length,
    })),
    currentStreak,
    maxStreak,
    wordsFound,
    averageWordsPerGame: entries.length ? wordsFound / entries.length : null,
    fiveLetterWords,
    topWords,
  };
}

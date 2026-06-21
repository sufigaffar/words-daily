const LETTER_WEIGHTS: Record<string, number> = {
  A: 8, E: 8, I: 8, O: 7, U: 4,
  L: 4, S: 4, T: 5, R: 5, N: 5,
  D: 4, G: 3, B: 2, C: 2, M: 2,
  P: 2, F: 2, H: 2, W: 2, Y: 2,
  V: 2, K: 2, J: 1, X: 1, Q: 1, Z: 1,
};

const WEIGHTED_ALPHABET = Object.entries(LETTER_WEIGHTS).flatMap(
  ([letter, weight]) => Array(weight).fill(letter)
);

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function getDailyLetters(count: number): string[] {
  const rand = mulberry32(getDailySeed());
  return Array.from({ length: count }, () =>
    WEIGHTED_ALPHABET[Math.floor(rand() * WEIGHTED_ALPHABET.length)]
  );
}

let wordSet: Set<string> | null = null;

async function loadWordList(): Promise<Set<string>> {
  if (wordSet) return wordSet;
  const response = await fetch(`${import.meta.env.BASE_URL}words.txt`);
  const text = await response.text();
  wordSet = new Set(text.split('\n').map(w => w.trim().toLowerCase()));
  return wordSet;
}

function getLongestWordLengthSync(s: string, words: Set<string>): number {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      if (j - i > best && words.has(s.slice(i, j))) {
        best = j - i;
      }
    }
  }
  return best;
}

function scoreGridSync(grid: string[], words: Set<string>): number {
  const lower = grid.map(l => l.toLowerCase());
  const rowScore = Array.from({ length: 5 }, (_, r) =>
    getLongestWordLengthSync(lower.slice(r * 5, r * 5 + 5).join(''), words)
  ).reduce((sum, s) => sum + s, 0);
  const colScore = Array.from({ length: 5 }, (_, c) =>
    getLongestWordLengthSync(lower.filter((_, i) => i % 5 === c).join(''), words)
  ).reduce((sum, s) => sum + s, 0);
  return rowScore + colScore;
}

export async function calculateBestGrid(letters: string[]): Promise<string[]> {
  const words = await loadWordList();
  const baseSeed = getDailySeed();

  let globalBest = [...letters];
  let globalBestScore = scoreGridSync(globalBest, words);

  const NUM_RESTARTS = 20;
  const ITERATIONS = 20000;

  for (let restart = 0; restart < NUM_RESTARTS; restart++) {
    await new Promise(r => setTimeout(r, 0));
    const rand = mulberry32(baseSeed + restart * 999983);

    const current = [...letters];
    for (let i = current.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [current[i], current[j]] = [current[j], current[i]];
    }

    let currentScore = scoreGridSync(current, words);
    let best = [...current];
    let bestScore = currentScore;

    let temp = 5.0;
    const cooling = Math.pow(0.0001 / temp, 1 / ITERATIONS);

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const a = Math.floor(rand() * 25);
      const b = Math.floor(rand() * 25);
      if (a === b) continue;

      [current[a], current[b]] = [current[b], current[a]];
      const newScore = scoreGridSync(current, words);
      const delta = newScore - currentScore;

      if (delta > 0 || rand() < Math.exp(delta / temp)) {
        currentScore = newScore;
        if (currentScore > bestScore) {
          bestScore = currentScore;
          best = [...current];
        }
      } else {
        [current[a], current[b]] = [current[b], current[a]];
      }

      temp *= cooling;
    }

    if (bestScore > globalBestScore) {
      globalBestScore = bestScore;
      globalBest = best;
    }
  }

  return globalBest;
}

export async function isValidWord(word: string): Promise<boolean> {
  const wordSet = await loadWordList();
  return wordSet.has(word.toLowerCase());
}

export type WordMatch = { word: string; start: number };

async function getLongestSubstringWithPosition(letters: string): Promise<WordMatch> {
  // if there is an unplaced letter in the row, it just duplicates the shorter word without that row
  let best: WordMatch = { word: '', start: 0 };
  for (let i = 0; i < letters.length; i++) {
    for (let j = i + 1; j <= letters.length; j++) {
      const substring = letters.slice(i, j);
      if (await isValidWord(substring) && substring.length > best.word.length) {
        best = { word: substring, start: i };
      }
    }
  }
  return best;
}

export async function calculateScore(letters: string[]): Promise<[WordMatch[], WordMatch[]]> {
  await loadWordList();

  const rows = Array.from(
    { length: 5 },
    (_, i) => letters.slice(i * 5, i * 5 + 5).join('')
  );

  const columns = Array.from(
    { length: 5 },
    (_, i) => letters.filter((_, index) => index % 5 === i).join('')
  );

  const rowMatches = await Promise.all(rows.map(getLongestSubstringWithPosition));
  const columnMatches = await Promise.all(columns.map(getLongestSubstringWithPosition));

  return [rowMatches, columnMatches];
}
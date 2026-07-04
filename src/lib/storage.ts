import type { JokerId, Quiz, TierId } from './model';

const QUIZZES_KEY = 'partyquiz.quizzes';
const runKey = (quizId: string) => `partyquiz.run.${quizId}`;

export interface TaskResult {
  taskId: string;
  tier: TierId | null; // null bei Sachpreis-Aufgabe
  correct: boolean;
  money: number;
  item: string | null;
  detail?: string;
  /** Original-Bild zur Auflösung (z. B. unverpixelt bei Bilderraten) */
  image?: string | null;
}

export type PlayPhase = 'intro' | 'question' | 'result' | 'done';

export interface RunState {
  quizId: string;
  index: number;
  phase: PlayPhase;
  tier: TierId | null;
  jokersLeft: Record<JokerId, number>;
  /** Im aktuellen Task aktivierte Joker */
  active: Record<JokerId, boolean>;
  results: TaskResult[];
}

export function newRun(quiz: Quiz): RunState {
  return {
    quizId: quiz.id,
    index: 0,
    phase: 'intro',
    tier: null,
    jokersLeft: { ...quiz.jokers },
    active: { askFriend: false, twoTries: false },
    results: [],
  };
}

export function loadQuizzes(): Quiz[] {
  try {
    return JSON.parse(localStorage.getItem(QUIZZES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function getQuiz(id: string): Quiz | null {
  return loadQuizzes().find((q) => q.id === id) ?? null;
}

export function saveQuiz(quiz: Quiz): void {
  const all = loadQuizzes();
  const i = all.findIndex((q) => q.id === quiz.id);
  if (i >= 0) all[i] = quiz;
  else all.push(quiz);
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(all));
}

export function deleteQuiz(id: string): void {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(loadQuizzes().filter((q) => q.id !== id)));
  clearRun(id);
}

export function loadRun(quizId: string): RunState | null {
  try {
    const raw = localStorage.getItem(runKey(quizId));
    return raw ? (JSON.parse(raw) as RunState) : null;
  } catch {
    return null;
  }
}

export function saveRun(run: RunState): void {
  localStorage.setItem(runKey(run.quizId), JSON.stringify(run));
}

export function clearRun(quizId: string): void {
  localStorage.removeItem(runKey(quizId));
}

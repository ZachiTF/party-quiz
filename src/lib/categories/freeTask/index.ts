import type { Category } from '../types';
import type { Rng } from '../../rng';
import { FREE_POOL } from '../../data/questionPools';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export interface FreeTaskConfig {
  prompt: string;
  /** Zeitlimit in Sekunden, 0 = ohne Limit (Timer läuft trotzdem mit) */
  timeLimit: number;
}

export const freeTask: Category<FreeTaskConfig> = {
  id: 'freeTask',
  name: 'Freie Aufgabe',
  icon: '🎭',
  description: 'Eine Aufgabe zum Machen – der Quizmaster entscheidet, ob sie geschafft ist.',
  supportedJokers: ['askFriend'],
  createDefault: () => ({ prompt: '', timeLimit: 0 }),
  generate: (rng: Rng) => {
    const entry = rng.pick(FREE_POOL);
    return { prompt: entry.prompt, timeLimit: entry.timeLimit };
  },
  Editor,
  Player,
};

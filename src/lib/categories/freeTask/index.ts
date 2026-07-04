import type { Category } from '../types';
import type { Rng } from '../../rng';
import { FREE_POOL } from '../../data/questionPools';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export interface FreeTaskConfig {
  prompt: string;
}

export const freeTask: Category<FreeTaskConfig> = {
  id: 'freeTask',
  name: 'Freie Aufgabe',
  icon: '🎭',
  description: 'Eine Aufgabe zum Machen – der Quizmaster entscheidet, ob sie geschafft ist.',
  supportedJokers: ['askFriend'],
  createDefault: () => ({ prompt: '' }),
  generate: (rng: Rng) => ({ prompt: rng.pick(FREE_POOL) }),
  Editor,
  Player,
};

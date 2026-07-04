import type { Category } from '../types';
import type { Rng } from '../../rng';
import { NUM_POOL } from '../../data/questionPools';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export interface NumberGuessConfig {
  question: string;
  answer: number;
  tolerance: number;
  toleranceType: 'abs' | 'pct';
  unit: string;
}

export function allowedDelta(config: NumberGuessConfig): number {
  return config.toleranceType === 'pct'
    ? Math.abs(config.answer) * (config.tolerance / 100)
    : config.tolerance;
}

export const numberGuess: Category<NumberGuessConfig> = {
  id: 'numberGuess',
  name: 'Schätzfrage',
  icon: '🔢',
  description: 'Schätze eine Zahl – liegst du nah genug dran, gewinnst du.',
  supportedJokers: ['askFriend', 'twoTries'],
  createDefault: () => ({ question: '', answer: 0, tolerance: 0, toleranceType: 'abs', unit: '' }),
  generate: (rng: Rng) => {
    const entry = rng.pick(NUM_POOL);
    return {
      question: entry.question,
      answer: entry.answer,
      tolerance: entry.tolerance,
      toleranceType: 'abs' as const,
      unit: entry.unit ?? '',
    };
  },
  Editor,
  Player,
};

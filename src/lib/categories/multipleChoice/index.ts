import type { Category } from '../types';
import type { Rng } from '../../rng';
import { MC_POOL } from '../../data/questionPools';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export interface MultipleChoiceConfig {
  question: string;
  options: string[];
  correctIndex: number;
}

export const multipleChoice: Category<MultipleChoiceConfig> = {
  id: 'multipleChoice',
  name: 'Multiple Choice',
  icon: '❓',
  description: 'Eine Wissensfrage mit mehreren Antwortmöglichkeiten – nur eine ist richtig.',
  supportedJokers: ['askFriend', 'twoTries'],
  createDefault: () => ({ question: '', options: ['', ''], correctIndex: 0 }),
  generate: (rng: Rng) => {
    const entry = rng.pick(MC_POOL);
    return { question: entry.question, options: [...entry.options], correctIndex: 0 };
  },
  Editor,
  Player,
};

import type { Category } from '../types';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export type PictureMode = 'plain' | 'pixelate' | 'zoom';

export interface PictureGuessConfig {
  imageUrl: string;
  question: string;
  mode: PictureMode;
  /** Leer = der Quizmaster wertet die mündliche Antwort */
  options: string[];
  correctIndex: number;
}

export const pictureGuess: Category<PictureGuessConfig> = {
  id: 'pictureGuess',
  name: 'Bilderraten',
  icon: '🖼️',
  description: 'Erkenne, was auf dem Bild zu sehen ist – eventuell verpixelt oder herangezoomt.',
  supportedJokers: ['askFriend', 'twoTries'],
  createDefault: () => ({
    imageUrl: '',
    question: 'Was ist auf dem Bild zu sehen?',
    mode: 'pixelate',
    options: [],
    correctIndex: 0,
  }),
  Editor,
  Player,
};

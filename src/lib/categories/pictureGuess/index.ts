import type { Category } from '../types';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export type PictureMode = 'plain' | 'pixelate' | 'zoom';

export interface PictureGuessConfig {
  imageUrl: string;
  question: string;
  mode: PictureMode;
  /** Startstufe 1 (extrem verpixelt/gezoomt) … 5 (am gröbsten erkennbar); im Quiz gibt es genau eine Hinweis-Stufe obendrauf */
  startLevel: number;
  /** Auflösung, die nach der Antwort gezeigt wird (z. B. der Skin-Name) */
  reveal: string;
  /** Nur für alte Speicherstände (früher 1–10); wird in startLevel umgerechnet */
  strength?: number;
  /** Leer = der Quizmaster wertet die mündliche Antwort */
  options: string[];
  correctIndex: number;
}

/** Startstufe mit Migration alter Configs (strength 1–10, 10 = am schwersten). */
export function effectiveStartLevel(config: PictureGuessConfig): number {
  if (config.startLevel >= 1 && config.startLevel <= 5) return Math.round(config.startLevel);
  const strength = config.strength ?? 5;
  return Math.min(5, Math.max(1, Math.round((11 - strength) / 2)));
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
    startLevel: 3,
    reveal: '',
    options: [],
    correctIndex: 0,
  }),
  Editor,
  Player,
};

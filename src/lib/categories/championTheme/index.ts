import type { Category } from '../types';
import type { Rng } from '../../rng';
import { CHAMPION_THEMES } from '../../data/championThemes';
import Editor from './Editor.svelte';
import Player from './Player.svelte';

export interface ChampionThemeConfig {
  videoId: string;
  /** Anzeigename des richtigen Champions */
  answer: string;
}

export const championTheme: Category<ChampionThemeConfig> = {
  id: 'championTheme',
  name: 'Champion-Song',
  icon: '🎵',
  description: 'Ein League-of-Legends-Champion-Theme spielt – welcher Champion ist es?',
  supportedJokers: ['askFriend', 'twoTries'],
  createDefault: () => ({ videoId: '', answer: '' }),
  generate: (rng: Rng) => {
    const theme = rng.pick(CHAMPION_THEMES);
    return { videoId: theme.videoId, answer: theme.champion };
  },
  Editor,
  Player,
};

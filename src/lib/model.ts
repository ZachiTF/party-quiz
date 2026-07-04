export type TierId = 'small' | 'medium' | 'big';
export type JokerId = 'askFriend' | 'twoTries';

export interface TierValue {
  /** Trostbetrag – gibt es auch bei falscher Antwort */
  base: number;
  /** Gewinnbetrag bei richtiger Antwort */
  win: number;
}

export type Reward = { kind: 'money' } | { kind: 'item'; label: string };

export interface Task {
  id: string;
  categoryId: string;
  reward: Reward;
  config: unknown;
}

export interface Quiz {
  id: string;
  name: string;
  seed: string;
  tiers: Record<TierId, TierValue>;
  jokers: Record<JokerId, number>;
  tasks: Task[];
}

export const TIER_IDS: TierId[] = ['small', 'medium', 'big'];
export const TIER_LABELS: Record<TierId, string> = {
  small: 'Klein',
  medium: 'Mittel',
  big: 'Groß',
};

export const JOKER_IDS: JokerId[] = ['askFriend', 'twoTries'];
export const JOKER_LABELS: Record<JokerId, string> = {
  askFriend: '📞 Freund fragen',
  twoTries: '🔁 Zwei Versuche',
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Standard-Seed: heutiges Datum, z. B. "2026-07-04" */
export function todaySeed(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Erzeugt die drei Einsatz-Stufen aus einem Min/Max-Betrag:
 * Klein = sicher, aber wenig; Groß = alles oder nichts.
 */
export function autoTiers(min: number, max: number): Record<TierId, TierValue> {
  const round = (n: number) => Math.round(n * 100) / 100;
  const lerp = (t: number) => round(min + (max - min) * t);
  return {
    small: { base: round(min), win: lerp(1 / 3) },
    medium: { base: round(min / 2), win: lerp(2 / 3) },
    big: { base: 0, win: round(max) },
  };
}

export function createQuiz(): Quiz {
  return {
    id: uid(),
    name: 'Neues Quiz',
    seed: todaySeed(),
    tiers: autoTiers(1, 10),
    jokers: { askFriend: 1, twoTries: 1 },
    tasks: [],
  };
}

export function formatEuro(n: number): string {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

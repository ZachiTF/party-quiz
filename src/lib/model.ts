export type TierId = 'small' | 'medium' | 'big';
export type JokerId = 'askFriend' | 'twoTries';

export interface TierValue {
  /** Trostbetrag – gibt es auch bei falscher Antwort */
  base: number;
  /** Gewinnbetrag bei richtiger Antwort */
  win: number;
}

export interface Task {
  id: string;
  categoryId: string;
  config: unknown;
}

export interface Quiz {
  id: string;
  name: string;
  seed: string;
  tiers: Record<TierId, TierValue>;
  jokers: Record<JokerId, number>;
  /** Sachpreis-Pool: jeder Eintrag kann im Quiz genau einmal statt der Geld-Stufen gewählt werden */
  items: string[];
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
 * Builds the three stake tiers from a min/max amount so that the expected
 * payout at a 50/50 winrate is identical for every tier: (base + win) / 2
 * = max / 2, i.e. win = max - base. Small = safe but capped, big = all or
 * nothing. Example 1-3 €: 1/2, 0.50/2.50, 0/3.
 */
export function autoTiers(min: number, max: number): Record<TierId, TierValue> {
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    small: { base: round(min), win: round(max - min) },
    medium: { base: round(min / 2), win: round(max - min / 2) },
    big: { base: 0, win: round(max) },
  };
}

export function createQuiz(): Quiz {
  return {
    id: uid(),
    name: 'Neues Quiz',
    seed: todaySeed(),
    tiers: autoTiers(1, 3),
    jokers: { askFriend: 1, twoTries: 1 },
    items: [],
    tasks: [],
  };
}

export function formatEuro(n: number): string {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

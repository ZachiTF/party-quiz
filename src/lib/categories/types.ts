import type { Component } from 'svelte';
import type { JokerId } from '../model';
import type { Rng } from '../rng';

export interface EditorProps<C = any> {
  /** Tiefer $state-Proxy – Editoren dürfen direkt hineinschreiben (bind:value). */
  config: C;
}

export interface PlayerProps<C = any> {
  config: C;
  /** Seed für deterministisches Mischen (Quiz-Seed + Task-Id) */
  seed: string;
  /** 2, wenn der Zwei-Versuche-Joker aktiv ist */
  maxAttempts: number;
  /** true in der Editor-Vorschau */
  preview?: boolean;
  /** Endgültiges Ergebnis; detail = Auflösung für den Ergebnis-Screen */
  onResult: (correct: boolean, detail?: string) => void;
}

export interface Category<C = any> {
  id: string;
  name: string;
  icon: string;
  /** Wird dem Spieler auf der Kategorie-Karte gezeigt (Frage noch verdeckt) */
  description: string;
  supportedJokers: JokerId[];
  createDefault(): C;
  /** Optional: Seed-basierte Instanz aus einem eingebauten Pool erzeugen */
  generate?(rng: Rng): C;
  Editor: Component<EditorProps<C>>;
  Player: Component<PlayerProps<C>>;
}

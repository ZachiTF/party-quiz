import type { Category } from './types';
import { championTheme } from './championTheme';
import { multipleChoice } from './multipleChoice';
import { numberGuess } from './numberGuess';
import { pictureGuess } from './pictureGuess';
import { freeTask } from './freeTask';

export type { Category } from './types';

/** Reihenfolge = Anzeige-Reihenfolge im Editor */
export const CATEGORIES: Category[] = [championTheme, multipleChoice, numberGuess, pictureGuess, freeTask];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

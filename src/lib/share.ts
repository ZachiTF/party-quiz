import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Quiz } from './model';

/** Quiz als teilbaren Link kodieren (öffnet die Import-Ansicht). */
export function quizToLink(quiz: Quiz): string {
  const q = compressToEncodedURIComponent(JSON.stringify(quiz));
  const base = location.href.split('#')[0];
  return `${base}#/import?q=${q}`;
}

export function quizFromParam(q: string): Quiz | null {
  try {
    const json = decompressFromEncodedURIComponent(q);
    if (!json) return null;
    const quiz = JSON.parse(json);
    if (typeof quiz?.id === 'string' && typeof quiz?.name === 'string' && Array.isArray(quiz?.tasks)) {
      return quiz as Quiz;
    }
  } catch {
    /* ungültiger Link */
  }
  return null;
}

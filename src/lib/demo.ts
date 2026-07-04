import { autoTiers, uid, todaySeed, type Quiz } from './model';
import { createRng } from './rng';
import { CATEGORIES } from './categories';

/** Beispiel-Quiz mit einer Aufgabe pro Kategorie (generierbare werden aus dem Seed gewürfelt). */
export function createDemoQuiz(): Quiz {
  const seed = todaySeed();
  const quiz: Quiz = {
    id: uid(),
    name: 'Beispiel-Quiz',
    seed,
    tiers: autoTiers(1, 10),
    jokers: { askFriend: 1, twoTries: 1 },
    tasks: [],
  };
  for (const [i, cat] of CATEGORIES.entries()) {
    quiz.tasks.push({
      id: uid(),
      categoryId: cat.id,
      reward: { kind: 'money' },
      config: cat.generate ? cat.generate(createRng(`${seed}:${i}`)) : cat.createDefault(),
    });
  }
  // Bilderraten hat keinen Generator – ein Beispielbild eintragen
  const pic = quiz.tasks.find((t) => t.categoryId === 'pictureGuess');
  if (pic) {
    pic.config = {
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg',
      question: 'Welches Bauwerk ist hier zu sehen?',
      mode: 'pixelate',
      options: ['Kolosseum', 'Circus Maximus', 'Pantheon', 'Arena von Verona'],
      correctIndex: 0,
    };
    pic.reward = { kind: 'item', label: '1 Tüte Gummibärchen' };
  }
  return quiz;
}

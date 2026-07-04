/** Eingebaute Frage-Pools für die Seed-Generierung ("Neu würfeln"). */

export interface McEntry {
  question: string;
  options: string[]; // erste Option ist die richtige, wird beim Spielen gemischt
}

export const MC_POOL: McEntry[] = [
  { question: 'Welcher Planet ist der größte unseres Sonnensystems?', options: ['Jupiter', 'Saturn', 'Neptun', 'Erde'] },
  { question: 'Wie viele Herzen hat ein Oktopus?', options: ['3', '1', '2', '4'] },
  { question: 'Wie heißt die Hauptstadt von Australien?', options: ['Canberra', 'Sydney', 'Melbourne', 'Perth'] },
  { question: 'Aus wie vielen Bundesländern besteht Deutschland?', options: ['16', '14', '15', '17'] },
  { question: 'Welches Element hat das chemische Symbol "Au"?', options: ['Gold', 'Silber', 'Aluminium', 'Argon'] },
  { question: 'Wer malte die Mona Lisa?', options: ['Leonardo da Vinci', 'Michelangelo', 'Rembrandt', 'Picasso'] },
  { question: 'Welches Tier ist das größte der Welt?', options: ['Blauwal', 'Afrikanischer Elefant', 'Pottwal', 'Giraffe'] },
  { question: 'In welchem Land steht der Kilimandscharo?', options: ['Tansania', 'Kenia', 'Äthiopien', 'Uganda'] },
  { question: 'Wie viele Saiten hat eine klassische Gitarre?', options: ['6', '4', '5', '7'] },
  { question: 'Welche Farbe entsteht aus Blau und Gelb?', options: ['Grün', 'Orange', 'Lila', 'Braun'] },
  { question: 'Wie nennt man ein Baby-Känguru?', options: ['Joey', 'Cub', 'Kit', 'Pup'] },
  { question: 'Welcher Kontinent ist flächenmäßig der größte?', options: ['Asien', 'Afrika', 'Nordamerika', 'Europa'] },
  { question: 'Was misst ein Barometer?', options: ['Luftdruck', 'Temperatur', 'Luftfeuchtigkeit', 'Windstärke'] },
  { question: 'Auf welcher Map spielt man klassisches League of Legends (5v5)?', options: ['Kluft der Beschwörer', 'Gewundener Wald', 'Heulende Schlucht', 'Arena von Noxus'] },
];

export interface NumEntry {
  question: string;
  answer: number;
  tolerance: number;
  unit?: string;
}

export const NUM_POOL: NumEntry[] = [
  { question: 'Wie hoch ist der Eiffelturm (mit Antenne)?', answer: 330, tolerance: 30, unit: 'm' },
  { question: 'Wie viele Tasten hat ein Klavier?', answer: 88, tolerance: 4 },
  { question: 'In welchem Jahr fiel die Berliner Mauer?', answer: 1989, tolerance: 2 },
  { question: 'Wie viele Knochen hat ein erwachsener Mensch?', answer: 206, tolerance: 12 },
  { question: 'Wie viele Mitgliedstaaten hat die EU?', answer: 27, tolerance: 1 },
  { question: 'Wie schnell kann ein Gepard sprinten?', answer: 110, tolerance: 15, unit: 'km/h' },
  { question: 'Wie viele Minuten dauert ein Fußballspiel (reguläre Spielzeit)?', answer: 90, tolerance: 0 },
  { question: 'Wie lang ist ein Marathon?', answer: 42, tolerance: 1, unit: 'km' },
  { question: 'Wie viele Zähne hat ein erwachsener Mensch (mit Weisheitszähnen)?', answer: 32, tolerance: 2 },
  { question: 'Wie viele Stockwerke hat das Empire State Building?', answer: 102, tolerance: 10 },
  { question: 'Bei wie viel Grad Celsius siedet Wasser auf dem Mount Everest (ungefähr)?', answer: 70, tolerance: 8, unit: '°C' },
  { question: 'Wie viele Champions gibt es ungefähr in League of Legends (2026)?', answer: 171, tolerance: 8 },
];

export interface FreeEntry {
  prompt: string;
  /** Zeitlimit in Sekunden, 0 = ohne Limit */
  timeLimit: number;
}

export const FREE_POOL: FreeEntry[] = [
  { prompt: 'Nenne 5 Pizzasorten!', timeLimit: 30 },
  { prompt: 'Nenne 5 Länder, die mit "S" beginnen!', timeLimit: 30 },
  { prompt: 'Mache 10 Kniebeugen – ohne umzufallen!', timeLimit: 0 },
  { prompt: 'Erzähle einen Witz. Lacht mindestens eine Person, zählt es als richtig!', timeLimit: 0 },
  { prompt: 'Summe ein bekanntes Lied, bis es jemand aus der Runde errät!', timeLimit: 30 },
  { prompt: 'Sage das Alphabet rückwärts von K bis A!', timeLimit: 20 },
  { prompt: 'Balanciere auf einem Bein – mit geschlossenen Augen, bis die Zeit um ist!', timeLimit: 10 },
  { prompt: 'Nenne 5 League-of-Legends-Champions, die mit "A" beginnen!', timeLimit: 30 },
  { prompt: 'Sprich ohne Pause über ein Thema, das der Quizmaster vorgibt!', timeLimit: 20 },
  { prompt: 'Zähle 6 Dinge auf, die man in einer Küche findet – ohne Besteck zu nennen!', timeLimit: 20 },
];

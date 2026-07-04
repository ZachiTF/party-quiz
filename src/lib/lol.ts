/** Champion-Daten live von Riots Data Dragon (mit localStorage-Cache + Fallback). */

export interface Champion {
  /** ddragon-Id, z. B. "MonkeyKing" für Wukong – wird für Bild-URLs gebraucht */
  id: string;
  /** Anzeigename, z. B. "Wukong" */
  name: string;
}

export interface ChampionSkin {
  num: number;
  name: string;
}

const CACHE_KEY = 'partyquiz.champions.v2';
const DDRAGON = 'https://ddragon.leagueoflegends.com';

interface Cache {
  version: string;
  fetchedAt: number;
  champs: Champion[];
}

function readCache(): Cache | null {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

async function fetchLatestVersion(): Promise<string> {
  const versions: string[] = await (await fetch(`${DDRAGON}/api/versions.json`)).json();
  return versions[0];
}

let inflight: Promise<Champion[]> | null = null;

export function loadChampions(): Promise<Champion[]> {
  if (!inflight) inflight = doLoad();
  return inflight;
}

export async function loadChampionNames(): Promise<string[]> {
  return (await loadChampions()).map((c) => c.name);
}

async function doLoad(): Promise<Champion[]> {
  const cache = readCache();
  // Cache max. 1 Tag alt -> kein Netz-Roundtrip bei jedem Task
  if (cache && Date.now() - cache.fetchedAt < 24 * 60 * 60 * 1000) return cache.champs;
  try {
    const version = await fetchLatestVersion();
    if (cache?.version === version) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cache, fetchedAt: Date.now() }));
      return cache.champs;
    }
    const data = await (await fetch(`${DDRAGON}/cdn/${version}/data/de_DE/champion.json`)).json();
    const champs = Object.values(data.data as Record<string, { id: string; name: string }>)
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version, fetchedAt: Date.now(), champs } satisfies Cache));
    return champs;
  } catch {
    return cache?.champs ?? FALLBACK_CHAMPIONS;
  }
}

/** Skins eines Champions (num 0 = Standard-Splash). */
export async function loadChampionSkins(championId: string): Promise<ChampionSkin[]> {
  const cache = readCache();
  const version = cache?.version ?? (await fetchLatestVersion());
  const data = await (
    await fetch(`${DDRAGON}/cdn/${version}/data/de_DE/champion/${championId}.json`)
  ).json();
  const champ = data.data[championId] as { name: string; skins: { num: number; name: string }[] };
  return champ.skins.map((s) => ({
    num: s.num,
    name: s.name === 'default' ? `${champ.name} (Standard)` : s.name,
  }));
}

/** Splash-Art-URL – versionsunabhängig und stabil. */
export function splashUrl(championId: string, skinNum: number): string {
  return `${DDRAGON}/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
}

/** ddragon-Ids, die sich nicht mechanisch aus dem Namen ableiten lassen. */
const ID_OVERRIDES: Record<string, string> = {
  Wukong: 'MonkeyKing',
  'Nunu & Willump': 'Nunu',
  'Renata Glasc': 'Renata',
  "Bel'Veth": 'Belveth',
  "Cho'Gath": 'Chogath',
  "Kai'Sa": 'Kaisa',
  "Kha'Zix": 'Khazix',
  "Vel'Koz": 'Velkoz',
  LeBlanc: 'Leblanc',
  'Dr. Mundo': 'DrMundo',
  'Jarvan IV.': 'JarvanIV',
};

function toChampion(name: string): Champion {
  return { id: ID_OVERRIDES[name] ?? name.replace(/[^A-Za-z]/g, ''), name };
}

/** Wird nur benutzt, wenn Data Dragon nicht erreichbar ist. */
export const FALLBACK_CHAMPIONS: Champion[] = [
  'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ambessa', 'Amumu', 'Anivia', 'Annie',
  'Aphelios', 'Ashe', 'Aurelion Sol', 'Aurora', 'Azir', 'Bard', "Bel'Veth", 'Blitzcrank',
  'Brand', 'Braum', 'Briar', 'Caitlyn', 'Camille', 'Cassiopeia', "Cho'Gath", 'Corki',
  'Darius', 'Diana', 'Dr. Mundo', 'Draven', 'Ekko', 'Elise', 'Evelynn', 'Ezreal',
  'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas',
  'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Illaoi', 'Irelia', 'Ivern', 'Janna',
  'Jarvan IV.', 'Jax', 'Jayce', 'Jhin', 'Jinx', "K'Sante", "Kai'Sa", 'Kalista', 'Karma',
  'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', "Kha'Zix", 'Kindred',
  'Kled', "Kog'Maw", 'LeBlanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian',
  'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Mel', 'Milio',
  'Miss Fortune', 'Mordekaiser', 'Morgana', 'Naafiri', 'Nami', 'Nasus', 'Nautilus',
  'Neeko', 'Nidalee', 'Nilah', 'Nocturne', 'Nunu & Willump', 'Olaf', 'Orianna', 'Ornn',
  'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus', "Rek'Sai", 'Rell',
  'Renata Glasc', 'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Samira', 'Sejuani',
  'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir',
  'Skarner', 'Smolder', 'Sona', 'Soraka', 'Swain', 'Sylas', 'Syndra', 'Tahm Kench',
  'Taliyah', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere',
  'Twisted Fate', 'Twitch', 'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', "Vel'Koz",
  'Vex', 'Vi', 'Viego', 'Viktor', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah',
  'Xerath', 'Xin Zhao', 'Yasuo', 'Yone', 'Yorick', 'Yuumi', 'Zac', 'Zed', 'Zeri',
  'Ziggs', 'Zilean', 'Zoe', 'Zyra',
].map(toChampion);

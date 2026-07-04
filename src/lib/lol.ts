/** Champion-Namen live von Riots Data Dragon (mit localStorage-Cache + Fallback). */

const CACHE_KEY = 'partyquiz.champions';

interface Cache {
  version: string;
  fetchedAt: number;
  names: string[];
}

function readCache(): Cache | null {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

let inflight: Promise<string[]> | null = null;

export function loadChampionNames(): Promise<string[]> {
  if (!inflight) inflight = doLoad();
  return inflight;
}

async function doLoad(): Promise<string[]> {
  const cache = readCache();
  // Cache max. 1 Tag alt -> kein Netz-Roundtrip bei jedem Task
  if (cache && Date.now() - cache.fetchedAt < 24 * 60 * 60 * 1000) return cache.names;
  try {
    const versions: string[] = await (
      await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    ).json();
    const version = versions[0];
    if (cache?.version === version) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cache, fetchedAt: Date.now() }));
      return cache.names;
    }
    const data = await (
      await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/de_DE/champion.json`)
    ).json();
    const names = Object.values(data.data as Record<string, { name: string }>)
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b, 'de'));
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version, fetchedAt: Date.now(), names } satisfies Cache));
    return names;
  } catch {
    return cache?.names ?? FALLBACK_CHAMPIONS;
  }
}

/** Wird nur benutzt, wenn Data Dragon nicht erreichbar ist. */
export const FALLBACK_CHAMPIONS: string[] = [
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
];

/**
 * Kuratierte Liste von Champion-Themes auf YouTube.
 * Wird für die Seed-Generierung ("Neu würfeln") und als Schnellauswahl im Editor benutzt.
 * Die Video-Ids können im Editor jederzeit durch eigene ersetzt werden.
 */
export interface ChampionTheme {
  champion: string;
  videoId: string;
}

export const CHAMPION_THEMES: ChampionTheme[] = [
  { champion: 'Ahri', videoId: 'tgXfFhdbgSU' },
  { champion: 'Aphelios', videoId: 'NQIeAbFT4Kc' },
  { champion: 'Camille', videoId: '7vysO2cER4Q' },
  { champion: 'Ekko', videoId: 'Pkrt9dwcUe4' },
  { champion: 'Gwen', videoId: 'ZJK0gG-WSUc' },
  { champion: 'Jhin', videoId: 'Nk_snsYu6RA' },
  { champion: 'Jinx', videoId: 'zWe4I6dXvms' },
  { champion: 'Kayn', videoId: 'IA0Z7_yPgKc' },
  { champion: 'Kindred', videoId: 'VNiW-W3CN1k' },
  { champion: 'Ornn', videoId: 'igxUAaNl5zw' },
  { champion: 'Pyke', videoId: 'DnVuZf1duho' },
  { champion: 'Senna', videoId: '7izlxCSb20Y' },
  { champion: 'Seraphine', videoId: 'O11UcwRctAE' },
  { champion: 'Sett', videoId: 'Fl_dVBZlfm8' },
  { champion: 'Sylas', videoId: 'MfBINVasJ2k' },
  { champion: 'Vi', videoId: '-TwLKyGnlCw' },
  { champion: 'Viego', videoId: 'TCQ9MEZL1Y4' },
  { champion: 'Yasuo', videoId: 'EYUiObjOE4A' },
  { champion: 'Yone', videoId: '6FlWvjg95sc' },
  { champion: 'Zed', videoId: 'puS6D-AImk0' },
  { champion: 'Zoe', videoId: 'BvrEideWKCk' },
];

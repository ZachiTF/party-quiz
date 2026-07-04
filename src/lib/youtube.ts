/** Minimaler Wrapper um die YouTube-IFrame-API (nur was wir brauchen). */
export interface YtPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}

interface YtNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width: number;
      height: number;
      playerVars: Record<string, string | number>;
      events: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
      };
    },
  ) => YtPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
}

let apiPromise: Promise<YtNamespace> | null = null;

export function loadYouTubeApi(): Promise<YtNamespace> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const w = window as any;
      if (w.YT?.Player) {
        resolve(w.YT);
        return;
      }
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(w.YT);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

export function isPlayingState(state: number): boolean {
  return state === 1; // YT.PlayerState.PLAYING
}

/** Akzeptiert YouTube-URLs (watch, youtu.be, shorts, embed) oder eine rohe Video-Id. */
export function parseVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    const v = url.searchParams.get('v');
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const m = url.pathname.match(/\/(?:embed\/|shorts\/|live\/)?([\w-]{11})(?:$|\/)/);
    if (m) return m[1];
  } catch {
    /* keine URL */
  }
  return null;
}

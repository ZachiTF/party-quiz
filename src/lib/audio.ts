/** Kleiner Buzzer über die Web-Audio-API – kein Audio-Asset nötig. */

let ctx: AudioContext | null = null;

/** Muss aus einer User-Geste heraus aufgerufen werden (z. B. Timer-Start), sonst blockt der Browser Audio. */
export function initAudio(): void {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
}

function beep(at: number, freq: number, duration: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.25, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration);
}

/** "Zeit abgelaufen"-Buzzer: zwei tiefe Bleeps. */
export function buzzer(): void {
  initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  beep(now, 233, 0.35);
  beep(now + 0.45, 175, 0.6);
}

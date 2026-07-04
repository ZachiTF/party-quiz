<script lang="ts">
  import type { PictureMode } from './index';

  let {
    src,
    mode,
    level,
    hint = false,
  }: { src: string; mode: PictureMode; level: number; hint?: boolean } = $props();

  // 6 Stufen, alle bewusst tief im verpixelten/gezoomten Bereich mit feiner
  // Abstufung: Startstufe 1–5 (Index 0–4) + genau eine Hinweis-Stufe (+1).
  // Werte = Anteil der Originalauflösung bzw. Zoom-Faktor.
  const PIXEL_LADDER = [0.03, 0.04, 0.06, 0.09, 0.12, 0.150];
  const ZOOM_LADDER = [14, 11, 8.5, 6.5, 5, 3.8];

  const idx = $derived(Math.min(5, Math.max(0, Math.round(level) - 1 + (hint ? 1 : 0))));
  const pixelFactor = $derived(PIXEL_LADDER[idx]);
  const zoomFactor = $derived(ZOOM_LADDER[idx]);

  let img = $state<HTMLImageElement | null>(null);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let loadError = $state(false);

  $effect(() => {
    if (mode !== 'pixelate') return;
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => {
      img = el;
      loadError = false;
    };
    el.onerror = () => {
      // zweiter Versuch ohne crossOrigin (Canvas wird "tainted", reines Anzeigen geht trotzdem)
      const plain = new Image();
      plain.onload = () => {
        img = plain;
        loadError = false;
      };
      plain.onerror = () => (loadError = true);
      plain.src = src;
    };
    el.src = src;
  });

  $effect(() => {
    if (!img || !canvas || mode !== 'pixelate') return;
    const w = Math.min(img.naturalWidth, 900);
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const small = document.createElement('canvas');
    small.width = Math.max(2, Math.round(w * pixelFactor));
    small.height = Math.max(2, Math.round(h * pixelFactor));
    const sctx = small.getContext('2d')!;
    sctx.drawImage(img, 0, 0, small.width, small.height);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(small, 0, 0, w, h);
  });
</script>

{#if loadError}
  <p class="hint">⚠️ Bild konnte nicht geladen werden.</p>
{:else if mode === 'pixelate'}
  <canvas bind:this={canvas} class="reveal-img"></canvas>
{:else if mode === 'zoom'}
  <div class="zoom-frame">
    <img {src} alt="Rätselbild" style={`transform: scale(${zoomFactor})`} onerror={() => (loadError = true)} />
  </div>
{:else}
  <img class="reveal-img" {src} alt="Rätselbild" onerror={() => (loadError = true)} />
{/if}

<style>
  .reveal-img {
    width: 100%;
    max-height: 45vh;
    object-fit: contain;
    border-radius: 12px;
    display: block;
  }
  .zoom-frame {
    width: 100%;
    max-height: 45vh;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .zoom-frame img {
    width: 100%;
    object-fit: contain;
    transition: transform 0.4s ease;
  }
</style>

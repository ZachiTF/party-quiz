<script lang="ts">
  import type { PictureMode } from './index';

  let {
    src,
    mode,
    step,
    maxSteps,
    strength = 5,
  }: { src: string; mode: PictureMode; step: number; maxSteps: number; strength?: number } = $props();

  // Schwierigkeit 1..10 -> Start-Verpixelung bzw. Start-Zoom; die Schritte
  // laufen geometrisch bis zum klaren Bild (letzter Schritt = Original)
  const s = $derived(Math.min(10, Math.max(1, strength ?? 5)));
  const startPixel = $derived(0.06 * Math.pow(0.008 / 0.06, (s - 1) / 9));
  const startZoom = $derived(3 * Math.pow(12 / 3, (s - 1) / 9));
  const progress = $derived(Math.min(step, maxSteps) / maxSteps);
  const pixelFactor = $derived(mode === 'pixelate' ? Math.pow(startPixel, 1 - progress) : 1);
  const zoomFactor = $derived(mode === 'zoom' ? Math.pow(startZoom, 1 - progress) : 1);

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

{#if mode !== 'plain'}
  <p class="hint">Stufe {Math.min(step, maxSteps) + 1}/{maxSteps + 1}</p>
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

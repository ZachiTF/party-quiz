<script lang="ts">
  import type { PlayerProps } from '../types';
  import { effectiveStartLevel, type PictureGuessConfig } from './index';
  import { createRng } from '../../rng';
  import RevealImage from './RevealImage.svelte';

  let { config, seed, maxAttempts, onResult }: PlayerProps<PictureGuessConfig> = $props();

  const level = $derived(effectiveStartLevel(config));
  let hintUsed = $state(false); // Verpixelung: 1 Gratis-Hinweis
  let zoomOuts = $state(0); // Zoom: Rauszoomen kostet je 10 % Gewinn
  let wrongPicks = $state<number[]>([]);
  let done = $state(false);

  const extraSteps = $derived(config.mode === 'zoom' ? zoomOuts : hintUsed ? 1 : 0);
  const canZoomOut = $derived(level - 1 + zoomOuts < 5);
  const penalty = $derived(config.mode === 'zoom' ? zoomOuts * 0.1 : 0);

  const hasOptions = $derived(config.options.length > 0);
  const order = $derived(hasOptions ? createRng(seed).shuffle(config.options.map((_, i) => i)) : []);

  // Auflösung: richtige Antwort + optionaler Auflösungstext (z. B. Skin-Name)
  const revealNote = $derived(config.reveal?.trim());
  const solution = $derived(
    hasOptions
      ? `Richtige Antwort: ${config.options[config.correctIndex]}${revealNote ? ` – ${revealNote}` : ''}`
      : revealNote || undefined,
  );

  // Nach der Antwort bekommt der Ergebnis-Screen das Original-Bild zur Auflösung
  const revealImage = $derived(config.mode !== 'plain' ? config.imageUrl : undefined);

  function finish(correct: boolean) {
    done = true;
    onResult(correct, { detail: solution, image: revealImage, penalty });
  }

  function pick(i: number) {
    if (done || wrongPicks.includes(i)) return;
    if (i === config.correctIndex) {
      finish(true);
    } else {
      wrongPicks.push(i);
      if (wrongPicks.length >= maxAttempts) finish(false);
    }
  }
</script>

<p class="question">{config.question}</p>

<RevealImage src={config.imageUrl} mode={config.mode} {level} {extraSteps} zoomX={config.zoomX} zoomY={config.zoomY} />

{#if config.mode === 'pixelate'}
  {#if !hintUsed}
    <button class="btn full" onclick={() => (hintUsed = true)}>🔍 Hinweis nehmen: eine Stufe deutlicher (1×)</button>
  {:else}
    <p class="hint">🔍 Hinweis-Stufe aktiv – deutlicher wird es nicht.</p>
  {/if}
{:else if config.mode === 'zoom'}
  {#if canZoomOut && !done}
    <button class="btn full" onclick={() => zoomOuts++}>🔍 Rauszoomen (−10&thinsp;% Gewinn)</button>
  {/if}
  {#if zoomOuts > 0}
    <p class="hint">{zoomOuts}× rausgezoomt – Gewinn um {zoomOuts * 10}&thinsp;% reduziert</p>
  {/if}
{/if}

{#if hasOptions}
  <div class="answers">
    {#each order as i (i)}
      <button
        class="btn answer"
        class:wrong-pick={wrongPicks.includes(i)}
        disabled={done || wrongPicks.includes(i)}
        onclick={() => pick(i)}
      >
        {config.options[i]}
      </button>
    {/each}
  </div>
  {#if wrongPicks.length > 0 && !done}
    <p class="hint">❌ Leider falsch – du hast noch einen Versuch!</p>
  {/if}
{:else}
  <p class="judge-hint">Antwort laut sagen – der Quizmaster entscheidet:</p>
  <div class="btn-row">
    <button class="btn correct" onclick={() => finish(true)}>✅ Richtig</button>
    <button class="btn wrong" onclick={() => finish(false)}>❌ Falsch</button>
  </div>
{/if}

<script lang="ts">
  import type { PlayerProps } from '../types';
  import { effectiveStartLevel, type PictureGuessConfig } from './index';
  import { createRng } from '../../rng';
  import RevealImage from './RevealImage.svelte';

  let { config, seed, maxAttempts, onResult }: PlayerProps<PictureGuessConfig> = $props();

  const level = effectiveStartLevel(config);
  let hintUsed = $state(false);
  let wrongPicks = $state<number[]>([]);
  let done = $state(false);

  const hasOptions = config.options.length > 0;
  const order = hasOptions ? createRng(seed).shuffle(config.options.map((_, i) => i)) : [];

  // Auflösung: richtige Antwort + optionaler Auflösungstext (z. B. Skin-Name)
  const revealNote = config.reveal?.trim();
  const solution = hasOptions
    ? `Richtige Antwort: ${config.options[config.correctIndex]}${revealNote ? ` – ${revealNote}` : ''}`
    : revealNote || undefined;

  // Nach der Antwort bekommt der Ergebnis-Screen das Original-Bild zur Auflösung
  const revealImage = config.mode !== 'plain' ? config.imageUrl : undefined;

  function pick(i: number) {
    if (done || wrongPicks.includes(i)) return;
    if (i === config.correctIndex) {
      done = true;
      onResult(true, solution, revealImage);
    } else {
      wrongPicks.push(i);
      if (wrongPicks.length >= maxAttempts) {
        done = true;
        onResult(false, solution, revealImage);
      }
    }
  }
</script>

<p class="question">{config.question}</p>

<RevealImage src={config.imageUrl} mode={config.mode} {level} hint={hintUsed} />

{#if config.mode !== 'plain'}
  {#if !hintUsed}
    <button class="btn full" onclick={() => (hintUsed = true)}>🔍 Hinweis nehmen: eine Stufe deutlicher (1×)</button>
  {:else}
    <p class="hint">🔍 Hinweis-Stufe aktiv – deutlicher wird es nicht.</p>
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
    <button class="btn correct" onclick={() => onResult(true, solution, revealImage)}>✅ Richtig</button>
    <button class="btn wrong" onclick={() => onResult(false, solution, revealImage)}>❌ Falsch</button>
  </div>
{/if}

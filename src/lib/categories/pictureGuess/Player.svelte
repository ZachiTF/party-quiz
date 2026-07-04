<script lang="ts">
  import type { PlayerProps } from '../types';
  import type { PictureGuessConfig } from './index';
  import { createRng } from '../../rng';
  import RevealImage from './RevealImage.svelte';

  let { config, seed, maxAttempts, onResult }: PlayerProps<PictureGuessConfig> = $props();

  const MAX_STEPS = 4;
  let step = $state(0);
  let wrongPicks = $state<number[]>([]);
  let done = $state(false);

  const hasOptions = config.options.length > 0;
  const order = hasOptions ? createRng(seed).shuffle(config.options.map((_, i) => i)) : [];
  const solution = hasOptions ? `Richtige Antwort: ${config.options[config.correctIndex]}` : undefined;

  function pick(i: number) {
    if (done || wrongPicks.includes(i)) return;
    if (i === config.correctIndex) {
      done = true;
      onResult(true, solution);
    } else {
      wrongPicks.push(i);
      if (wrongPicks.length >= maxAttempts) {
        done = true;
        onResult(false, solution);
      }
    }
  }
</script>

<p class="question">{config.question}</p>

<RevealImage src={config.imageUrl} mode={config.mode} {step} maxSteps={MAX_STEPS} />

{#if config.mode !== 'plain' && step < MAX_STEPS}
  <button class="btn full" onclick={() => step++}>🔍 Deutlicher zeigen</button>
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
    <button class="btn correct" onclick={() => onResult(true)}>✅ Richtig</button>
    <button class="btn wrong" onclick={() => onResult(false)}>❌ Falsch</button>
  </div>
{/if}

<script lang="ts">
  import type { PlayerProps } from '../types';
  import type { MultipleChoiceConfig } from './index';
  import { createRng } from '../../rng';

  let { config, seed, maxAttempts, onResult }: PlayerProps<MultipleChoiceConfig> = $props();

  // Antwortreihenfolge deterministisch aus dem Seed mischen
  const order = createRng(seed).shuffle(config.options.map((_, i) => i));

  let wrongPicks = $state<number[]>([]);
  let done = $state(false);

  function pick(i: number) {
    if (done || wrongPicks.includes(i)) return;
    if (i === config.correctIndex) {
      done = true;
      onResult(true, `Richtige Antwort: ${config.options[config.correctIndex]}`);
    } else {
      wrongPicks.push(i);
      if (wrongPicks.length >= maxAttempts) {
        done = true;
        onResult(false, `Richtig gewesen wäre: ${config.options[config.correctIndex]}`);
      }
    }
  }
</script>

<p class="question">{config.question}</p>

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

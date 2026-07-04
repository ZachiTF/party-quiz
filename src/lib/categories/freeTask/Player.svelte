<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { PlayerProps } from '../types';
  import type { FreeTaskConfig } from './index';
  import { buzzer, initAudio } from '../../audio';

  let { config, onResult }: PlayerProps<FreeTaskConfig> = $props();

  const limit = config.timeLimit ?? 0;

  let elapsed = $state(0);
  let running = $state(false);
  let buzzed = false;
  let interval: ReturnType<typeof setInterval> | undefined;

  const overLimit = $derived(limit > 0 && elapsed >= limit);

  function startTimer() {
    if (running) return;
    running = true;
    initAudio(); // Klick = User-Geste, damit der Buzzer später spielen darf
    interval = setInterval(() => {
      elapsed++;
      if (limit > 0 && elapsed >= limit && !buzzed) {
        buzzed = true;
        buzzer();
      }
    }, 1000);
  }

  onDestroy(() => clearInterval(interval));

  function fmt(s: number): string {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}`;
  }
</script>

<p class="question">{config.prompt}</p>

<div class="timer-box" class:over={overLimit}>
  <span class="timer-value">
    ⏱ {fmt(elapsed)}{limit > 0 ? ` / ${fmt(limit)} s` : ' s'}
  </span>
  {#if !running}
    <button class="btn primary" onclick={startTimer}>▶ Timer starten</button>
  {:else if overLimit}
    <span class="timer-note">Zeit abgelaufen!</span>
  {/if}
</div>

<p class="judge-hint">Der Quizmaster entscheidet:</p>
<div class="btn-row">
  <button class="btn correct" onclick={() => onResult(true)}>✅ Geschafft</button>
  <button class="btn wrong" onclick={() => onResult(false)}>❌ Nicht geschafft</button>
</div>

<style>
  .timer-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    background: var(--card-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.6rem 0.9rem;
    margin: 0.75rem 0;
  }
  .timer-value {
    font-variant-numeric: tabular-nums;
    font-size: 1.6rem;
    font-weight: 800;
  }
  .timer-box.over {
    border-color: var(--wrong);
    background: color-mix(in srgb, var(--wrong) 22%, var(--card-2));
    animation: timer-pulse 1s infinite;
  }
  .timer-box.over .timer-value,
  .timer-note {
    color: var(--wrong);
  }
  .timer-note {
    font-weight: 700;
  }
  @keyframes timer-pulse {
    50% {
      border-color: color-mix(in srgb, var(--wrong) 40%, var(--border));
    }
  }
</style>

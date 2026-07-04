<script lang="ts">
  import type { PlayerProps } from '../types';
  import { allowedDelta, type NumberGuessConfig } from './index';

  let { config, maxAttempts, onResult }: PlayerProps<NumberGuessConfig> = $props();

  let input = $state('');
  let attempts = $state(0);
  let hint = $state('');
  let done = $state(false);

  const unitSuffix = $derived(config.unit ? ` ${config.unit}` : '');

  function submit() {
    if (done) return;
    const guess = Number(input.replace(',', '.'));
    if (!Number.isFinite(guess)) return;
    attempts++;
    const delta = Math.abs(guess - config.answer);
    // absolute Toleranz erst in der Auflösung nennen – vorher verriete sie die Größenordnung
    const tolNote =
      config.tolerance > 0
        ? ` (±${config.tolerance.toLocaleString('de-DE')}${config.toleranceType === 'pct' ? ' %' : unitSuffix} war noch richtig)`
        : '';
    const detail = `Richtige Antwort: ${config.answer.toLocaleString('de-DE')}${unitSuffix}${tolNote}`;
    if (delta <= allowedDelta(config)) {
      done = true;
      onResult(true, { detail });
    } else if (attempts >= maxAttempts) {
      done = true;
      onResult(false, { detail });
    } else {
      hint = guess > config.answer ? '📉 Zu hoch! Noch ein Versuch:' : '📈 Zu tief! Noch ein Versuch:';
      input = '';
    }
  }
</script>

<p class="question">{config.question}</p>

<!-- Absolute Toleranz würde die Größenordnung der Antwort verraten -> nur Prozent anzeigen -->
{#if config.tolerance > 0 && config.toleranceType === 'pct'}
  <p class="hint">Toleranz: ±{config.tolerance.toLocaleString('de-DE')} %</p>
{:else if config.tolerance > 0}
  <p class="hint">Es gibt eine Toleranz – sie wird erst mit der Auflösung verraten.</p>
{/if}

{#if hint}
  <p class="hint">{hint}</p>
{/if}

<div class="btn-row">
  <input
    class="number-input"
    type="text"
    inputmode="decimal"
    bind:value={input}
    placeholder={`Zahl${unitSuffix}`}
    onkeydown={(e) => e.key === 'Enter' && submit()}
    disabled={done}
  />
  <button class="btn primary" onclick={submit} disabled={done || input.trim() === ''}>Antworten</button>
</div>

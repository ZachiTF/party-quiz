<script lang="ts">
  import type { PlayerProps } from '../types';
  import type { ChampionThemeConfig } from './index';
  import HiddenYouTubePlayer from './HiddenYouTubePlayer.svelte';
  import ChampionSelect from './ChampionSelect.svelte';

  let { config, maxAttempts, onResult }: PlayerProps<ChampionThemeConfig> = $props();

  let selected = $state<string | null>(null);
  let wrongPicks = $state<string[]>([]);
  let done = $state(false);

  function confirm() {
    if (!selected || done) return;
    if (selected === config.answer) {
      done = true;
      onResult(true, `Es war ${config.answer}!`);
    } else {
      wrongPicks.push(selected);
      selected = null;
      if (wrongPicks.length >= maxAttempts) {
        done = true;
        onResult(false, `Es war ${config.answer}.`);
      }
    }
  }
</script>

<p class="question">Welcher Champion gehört zu diesem Song?</p>

<HiddenYouTubePlayer videoId={config.videoId} />

{#if wrongPicks.length > 0 && !done}
  <p class="hint">❌ {wrongPicks[wrongPicks.length - 1]} war es nicht – noch ein Versuch!</p>
{/if}

<ChampionSelect {selected} disabledNames={wrongPicks} onPick={(name) => (selected = name)} />

<button class="btn primary full" disabled={!selected || done} onclick={confirm}>
  {selected ? `„${selected}" antworten` : 'Champion auswählen…'}
</button>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { EditorProps } from '../types';
  import type { ChampionThemeConfig } from './index';
  import { CHAMPION_THEMES } from '../../data/championThemes';
  import { loadChampionNames } from '../../lol';
  import { parseVideoId } from '../../youtube';

  let { config }: EditorProps<ChampionThemeConfig> = $props();

  // svelte-ignore state_referenced_locally
  let urlInput = $state(config.videoId);
  let urlError = $state(false);
  let championNames = $state<string[]>([]);

  onMount(() => {
    loadChampionNames().then((names) => (championNames = names));
  });

  function applyUrl() {
    const id = parseVideoId(urlInput);
    urlError = urlInput.trim() !== '' && !id;
    if (id) config.videoId = id;
  }

  function pickCurated(e: Event) {
    const champion = (e.currentTarget as HTMLSelectElement).value;
    const theme = CHAMPION_THEMES.find((t) => t.champion === champion);
    if (theme) {
      config.videoId = theme.videoId;
      config.answer = theme.champion;
      urlInput = theme.videoId;
      urlError = false;
    }
  }
</script>

<label class="field">
  <span>Aus der eingebauten Liste wählen</span>
  <select value={CHAMPION_THEMES.find((t) => t.videoId === config.videoId)?.champion ?? ''} onchange={pickCurated}>
    <option value="" disabled>– Champion-Theme wählen –</option>
    {#each CHAMPION_THEMES as theme (theme.champion)}
      <option value={theme.champion}>{theme.champion}</option>
    {/each}
  </select>
</label>

<label class="field">
  <span>… oder eigene YouTube-URL / Video-Id</span>
  <input type="text" bind:value={urlInput} onblur={applyUrl} onchange={applyUrl} placeholder="https://www.youtube.com/watch?v=…" />
  {#if urlError}<small class="error">Konnte keine Video-Id erkennen.</small>{/if}
</label>

<label class="field">
  <span>Richtiger Champion</span>
  <input type="text" bind:value={config.answer} list="champion-names" placeholder="z. B. Jhin" />
  <datalist id="champion-names">
    {#each championNames as name (name)}
      <option value={name}></option>
    {/each}
  </datalist>
</label>

{#if config.videoId}
  <div class="yt-preview">
    <img src={`https://i.ytimg.com/vi/${config.videoId}/mqdefault.jpg`} alt="Video-Vorschau" loading="lazy" />
    <small>Video: {config.videoId} (Vorschau nur hier im Editor sichtbar)</small>
  </div>
{/if}

<style>
  .yt-preview img {
    max-width: 200px;
    border-radius: 8px;
    display: block;
  }
  .error {
    color: var(--wrong);
  }
</style>

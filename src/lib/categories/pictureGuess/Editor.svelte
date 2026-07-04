<script lang="ts">
  import { onMount } from 'svelte';
  import type { EditorProps } from '../types';
  import type { PictureGuessConfig } from './index';
  import { loadChampions, loadChampionSkins, splashUrl, type Champion, type ChampionSkin } from '../../lol';
  import RevealImage from './RevealImage.svelte';

  let { config }: EditorProps<PictureGuessConfig> = $props();

  let useOptions = $state(config.options.length > 0);
  let previewStep = $state(0);

  // --- Champion-Splash-Auswahl (Data Dragon) ---
  let champions = $state<Champion[]>([]);
  let skins = $state<ChampionSkin[]>([]);
  let splashChamp = $state('');
  let splashSkin = $state<number | ''>('');
  let skinsLoading = $state(false);

  onMount(() => {
    loadChampions().then((c) => (champions = c));
  });

  async function champChosen() {
    splashSkin = '';
    skins = [];
    if (!splashChamp) return;
    skinsLoading = true;
    try {
      skins = await loadChampionSkins(splashChamp);
    } catch {
      skins = [{ num: 0, name: 'Standard' }];
    }
    skinsLoading = false;
  }

  function skinChosen() {
    if (splashChamp === '' || splashSkin === '') return;
    config.imageUrl = splashUrl(splashChamp, splashSkin);
    previewStep = 0;
  }

  function toggleOptions(on: boolean) {
    useOptions = on;
    if (on && config.options.length === 0) config.options = ['', ''];
    if (!on) {
      config.options = [];
      config.correctIndex = 0;
    }
  }

  function addOption() {
    config.options.push('');
  }

  function removeOption(i: number) {
    config.options.splice(i, 1);
    if (config.correctIndex >= config.options.length) config.correctIndex = 0;
    else if (config.correctIndex > i) config.correctIndex--;
  }
</script>

<label class="field">
  <span>Bild-URL</span>
  <input type="url" bind:value={config.imageUrl} placeholder="https://…/bild.jpg" />
</label>

<div class="field">
  <span>… oder LoL-Champion-Splash wählen <small>(alle Skins, via Data Dragon)</small></span>
  <div class="row">
    <select style="flex:1" bind:value={splashChamp} onchange={champChosen}>
      <option value="" disabled>– Champion –</option>
      {#each champions as champ (champ.id)}
        <option value={champ.id}>{champ.name}</option>
      {/each}
    </select>
    <select style="flex:1" bind:value={splashSkin} onchange={skinChosen} disabled={skins.length === 0}>
      <option value="" disabled>{skinsLoading ? 'Skins laden…' : '– Skin –'}</option>
      {#each skins as skin (skin.num)}
        <option value={skin.num}>{skin.name}</option>
      {/each}
    </select>
  </div>
</div>

<label class="field">
  <span>Frage</span>
  <input type="text" bind:value={config.question} />
</label>

<label class="field">
  <span>Anzeige-Modus</span>
  <select bind:value={config.mode}>
    <option value="pixelate">Verpixelt (stufenweise schärfer)</option>
    <option value="zoom">Herangezoomt (stufenweise weiter weg)</option>
    <option value="plain">Normal anzeigen</option>
  </select>
</label>

{#if config.mode !== 'plain'}
  <label class="field">
    <span>Schwierigkeit: <strong>{config.strength ?? 5}</strong>/10 (1 = leicht erkennbar, 10 = sehr schwer)</span>
    <input type="range" min="1" max="10" step="1" bind:value={config.strength} />
  </label>
{/if}

{#if config.imageUrl}
  {#if config.mode === 'plain'}
    <img class="editor-preview" src={config.imageUrl} alt="Vorschau" loading="lazy" />
  {:else}
    <div class="field">
      <span>Vorschau – so sieht es der Spieler (Regler = „Deutlicher zeigen"-Stufen)</span>
      <RevealImage src={config.imageUrl} mode={config.mode} step={previewStep} maxSteps={4} strength={config.strength ?? 5} />
      <input type="range" min="0" max="4" step="1" bind:value={previewStep} />
    </div>
  {/if}
{/if}

<label class="field checkbox">
  <input type="checkbox" checked={useOptions} onchange={(e) => toggleOptions(e.currentTarget.checked)} />
  <span>Antwortmöglichkeiten anzeigen (sonst wertet der Quizmaster)</span>
</label>

{#if useOptions}
  <div class="field">
    <span>Antworten <small>(richtige markieren)</small></span>
    {#each config.options as _, i}
      <div class="option-row">
        <input
          type="radio"
          name="pic-correct"
          checked={config.correctIndex === i}
          onchange={() => (config.correctIndex = i)}
        />
        <input type="text" bind:value={config.options[i]} placeholder={`Antwort ${i + 1}`} />
        <button class="btn small ghost" disabled={config.options.length <= 2} onclick={() => removeOption(i)}>✕</button>
      </div>
    {/each}
    <button class="btn small" disabled={config.options.length >= 6} onclick={addOption}>+ Antwort</button>
  </div>
{/if}

<style>
  .editor-preview {
    max-width: 200px;
    border-radius: 8px;
    display: block;
  }
</style>

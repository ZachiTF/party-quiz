<script lang="ts">
  import type { EditorProps } from '../types';
  import type { PictureGuessConfig } from './index';

  let { config }: EditorProps<PictureGuessConfig> = $props();

  let useOptions = $state(config.options.length > 0);

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

{#if config.imageUrl}
  <img class="editor-preview" src={config.imageUrl} alt="Vorschau" loading="lazy" />
{/if}

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

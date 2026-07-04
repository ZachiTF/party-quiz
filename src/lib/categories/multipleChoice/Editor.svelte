<script lang="ts">
  import type { EditorProps } from '../types';
  import type { MultipleChoiceConfig } from './index';

  let { config }: EditorProps<MultipleChoiceConfig> = $props();

  function addOption() {
    config.options.push('');
  }

  function removeOption(i: number) {
    config.options.splice(i, 1);
    // removing the marked-correct option must not silently mark another one
    if (config.correctIndex === i || config.correctIndex >= config.options.length) config.correctIndex = 0;
    else if (config.correctIndex > i) config.correctIndex--;
  }
</script>

<label class="field">
  <span>Frage</span>
  <input type="text" bind:value={config.question} placeholder="Frage eingeben…" />
</label>

<div class="field">
  <span>Antworten <small>(richtige markieren)</small></span>
  {#each config.options as _, i}
    <div class="option-row">
      <input
        type="radio"
        name="correct"
        title="Diese Antwort ist richtig"
        checked={config.correctIndex === i}
        onchange={() => (config.correctIndex = i)}
      />
      <input type="text" bind:value={config.options[i]} placeholder={`Antwort ${i + 1}`} />
      <button
        class="btn small ghost"
        disabled={config.options.length <= 2}
        onclick={() => removeOption(i)}
        title="Antwort entfernen">✕</button
      >
    </div>
  {/each}
  <button class="btn small" disabled={config.options.length >= 6} onclick={addOption}>+ Antwort</button>
</div>

<script lang="ts">
  import type { EditorProps } from '../types';
  import type { NumberGuessConfig } from './index';

  let { config }: EditorProps<NumberGuessConfig> = $props();
</script>

<label class="field">
  <span>Frage</span>
  <input type="text" bind:value={config.question} placeholder="z. B. Wie hoch ist der Eiffelturm?" />
</label>

<div class="field-grid">
  <label class="field">
    <span>Richtige Zahl</span>
    <input type="number" bind:value={config.answer} step="any" />
  </label>
  <label class="field">
    <span>Einheit <small>(optional)</small></span>
    <input type="text" bind:value={config.unit} placeholder="m, km/h, …" />
  </label>
  <label class="field">
    <span>Toleranz (±)</span>
    <input type="number" bind:value={config.tolerance} min="0" step="any" />
  </label>
  <label class="field">
    <span>Toleranz-Art</span>
    <select bind:value={config.toleranceType}>
      <option value="abs">absolut</option>
      <option value="pct">Prozent</option>
    </select>
  </label>
</div>

<script lang="ts">
  import type { EditorProps } from '../types';
  import type { FreeTaskConfig } from './index';

  let { config }: EditorProps<FreeTaskConfig> = $props();

  config.timeLimit ??= 0;
</script>

<label class="field">
  <span>Aufgabe</span>
  <textarea rows="3" bind:value={config.prompt} placeholder="z. B. Nenne 5 Pizzasorten!"></textarea>
</label>

<label class="field">
  <span>Zeitlimit in Sekunden <small>(0 = ohne Limit; der Timer läuft trotzdem mit)</small></span>
  <input type="number" min="0" max="600" bind:value={config.timeLimit} />
</label>

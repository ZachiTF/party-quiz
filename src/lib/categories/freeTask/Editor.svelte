<script lang="ts">
  import type { EditorProps } from '../types';
  import type { FreeTaskConfig } from './index';

  let { config }: EditorProps<FreeTaskConfig> = $props();
</script>

<label class="field">
  <span>Aufgabe</span>
  <textarea rows="3" bind:value={config.prompt} placeholder="z. B. Nenne in 30 Sekunden 5 Pizzasorten!"></textarea>
</label>

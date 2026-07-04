<script lang="ts">
  import type { PlayerProps } from '../types';
  import type { FreeTaskConfig } from './index';

  let { config, onResult }: PlayerProps<FreeTaskConfig> = $props();
</script>

<p class="question">{config.prompt}</p>

<p class="judge-hint">Der Quizmaster entscheidet:</p>
<div class="btn-row">
  <button class="btn correct" onclick={() => onResult(true)}>✅ Geschafft</button>
  <button class="btn wrong" onclick={() => onResult(false)}>❌ Nicht geschafft</button>
</div>

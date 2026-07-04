<script lang="ts">
  import { onMount } from 'svelte';
  import { loadChampionNames } from '../../lol';

  let {
    selected = null,
    disabledNames = [],
    onPick,
  }: {
    selected?: string | null;
    disabledNames?: string[];
    onPick: (name: string) => void;
  } = $props();

  let all = $state<string[]>([]);
  let filter = $state('');

  onMount(() => {
    loadChampionNames().then((names) => (all = names));
  });

  const filtered = $derived(
    filter.trim() ? all.filter((n) => n.toLowerCase().includes(filter.trim().toLowerCase())) : all,
  );
  const MAX_SHOWN = 24;
</script>

<input class="champ-filter" type="text" bind:value={filter} placeholder="🔍 Champion suchen…" />

<div class="champ-list">
  {#each filtered.slice(0, MAX_SHOWN) as name (name)}
    <button
      class="btn small champ"
      class:selected={selected === name}
      class:wrong-pick={disabledNames.includes(name)}
      disabled={disabledNames.includes(name)}
      onclick={() => onPick(name)}
    >
      {name}
    </button>
  {/each}
  {#if filtered.length > MAX_SHOWN}
    <span class="hint">… und {filtered.length - MAX_SHOWN} weitere – tippe zum Filtern</span>
  {/if}
  {#if all.length === 0}
    <span class="hint">Champions werden geladen…</span>
  {/if}
</div>

<style>
  .champ-filter {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  .champ-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    max-height: 14rem;
    overflow-y: auto;
  }
  .champ.selected {
    outline: 3px solid var(--accent);
  }
</style>

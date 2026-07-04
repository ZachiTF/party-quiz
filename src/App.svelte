<script lang="ts">
  import { parseHash, type Route } from './lib/router';
  import Home from './views/Home.svelte';
  import Editor from './views/Editor.svelte';
  import Play from './views/Play.svelte';
  import Import from './views/Import.svelte';

  let route = $state<Route>(parseHash(location.hash));

  function onHashChange() {
    route = parseHash(location.hash);
  }
</script>

<svelte:window onhashchange={onHashChange} />

<main class="app">
  {#key JSON.stringify(route)}
    {#if route.view === 'edit'}
      <Editor id={route.id} />
    {:else if route.view === 'play'}
      <Play id={route.id} />
    {:else if route.view === 'import'}
      <Import q={route.q} />
    {:else}
      <Home />
    {/if}
  {/key}
</main>

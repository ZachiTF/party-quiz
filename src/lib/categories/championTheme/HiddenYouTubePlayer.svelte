<script lang="ts">
  import { onMount } from 'svelte';
  import { loadYouTubeApi, type YtPlayer } from '../../youtube';

  let { videoId }: { videoId: string } = $props();

  let host: HTMLDivElement;
  let player: YtPlayer | null = null;
  let ready = $state(false);
  let playing = $state(false);

  onMount(() => {
    let destroyed = false;
    loadYouTubeApi().then((YT) => {
      if (destroyed) return;
      player = new YT.Player(host, {
        videoId,
        width: 200,
        height: 200,
        playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, iv_load_policy: 3 },
        events: {
          onReady: () => (ready = true),
          onStateChange: (e) => (playing = e.data === 1),
        },
      });
    });
    return () => {
      destroyed = true;
      player?.destroy();
    };
  });

  function toggle() {
    if (playing) player?.pauseVideo();
    else player?.playVideo();
  }

  function restart() {
    player?.seekTo(0, true);
    player?.playVideo();
  }
</script>

<!-- Das Video bleibt unsichtbar (offscreen), nur der Ton ist zu hören -->
<div class="yt-hidden" aria-hidden="true">
  <div bind:this={host}></div>
</div>

<div class="btn-row">
  <button class="btn primary" onclick={toggle} disabled={!ready}>
    {#if !ready}⏳ Song lädt…{:else if playing}⏸ Pause{:else}▶️ Song abspielen{/if}
  </button>
  <button class="btn" onclick={restart} disabled={!ready} title="Von vorn abspielen">↺</button>
</div>

<style>
  .yt-hidden {
    position: fixed;
    left: -10000px;
    top: 0;
    width: 200px;
    height: 200px;
    overflow: hidden;
  }
</style>

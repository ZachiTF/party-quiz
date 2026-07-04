<script lang="ts">
  import {
    formatEuro,
    JOKER_IDS,
    JOKER_LABELS,
    TIER_IDS,
    TIER_LABELS,
    type JokerId,
    type TierId,
  } from '../lib/model';
  import { clearRun, getQuiz, loadRun, newRun, saveRun, type RunState } from '../lib/storage';
  import { getCategory } from '../lib/categories';
  import { navigate } from '../lib/router';

  let { id }: { id: string } = $props();

  const quiz = getQuiz(id);

  function initRun(): RunState | null {
    if (!quiz) return null;
    const saved = loadRun(id);
    // gespeicherten Spielstand nur übernehmen, wenn er noch zum Quiz passt
    if (saved && saved.phase !== 'done' && saved.index <= quiz.tasks.length && saved.results) {
      return saved;
    }
    return newRun(quiz);
  }

  let run = $state<RunState | null>(initRun());

  // Spielstand bei jeder Änderung sichern (überlebt Reload/Bildschirmsperre)
  $effect(() => {
    if (run) saveRun($state.snapshot(run) as RunState);
  });

  const task = $derived(quiz && run && run.index < quiz.tasks.length ? quiz.tasks[run.index] : null);
  const cat = $derived(task ? getCategory(task.categoryId) : undefined);
  const totalMoney = $derived(run?.results.reduce((sum, r) => sum + r.money, 0) ?? 0);
  const items = $derived(run?.results.flatMap((r) => (r.item ? [r.item] : [])) ?? []);
  const maxAttempts = $derived(run?.active.twoTries ? 2 : 1);
  const lastResult = $derived(run?.results[run.results.length - 1]);

  function chooseTier(tier: TierId) {
    if (!run) return;
    run.tier = tier;
    run.phase = 'question';
  }

  function startItemTask() {
    if (!run) return;
    run.tier = null;
    run.phase = 'question';
  }

  function useJoker(joker: JokerId) {
    if (!run || run.jokersLeft[joker] <= 0 || run.active[joker]) return;
    run.jokersLeft[joker]--;
    run.active[joker] = true;
  }

  function handleResult(correct: boolean, detail?: string, image?: string) {
    if (!run || !quiz || !task) return;
    const money =
      task.reward.kind === 'money' && run.tier
        ? correct
          ? quiz.tiers[run.tier].win
          : quiz.tiers[run.tier].base
        : 0;
    const item = task.reward.kind === 'item' && correct ? task.reward.label : null;
    run.results.push({ taskId: task.id, tier: run.tier, correct, money, item, detail, image: image ?? null });
    run.phase = 'result';
  }

  function next() {
    if (!run || !quiz) return;
    run.index++;
    run.tier = null;
    run.active = { askFriend: false, twoTries: false };
    run.phase = run.index >= quiz.tasks.length ? 'done' : 'intro';
  }

  function restart() {
    if (!quiz) return;
    if (run && run.phase !== 'done' && !confirm('Laufendes Spiel wirklich neu starten?')) return;
    clearRun(quiz.id);
    run = newRun(quiz);
  }

  function taskIcon(taskId: string): string {
    const t = quiz?.tasks.find((x) => x.id === taskId);
    return t ? (getCategory(t.categoryId)?.icon ?? '❓') : '❓';
  }
</script>

{#if !quiz || !run}
  <div class="card">
    <h2>😕 Quiz nicht gefunden</h2>
    <button class="btn" onclick={() => navigate('/')}>Zur Übersicht</button>
  </div>
{:else}
  <div class="statusbar">
    <span>
      {#if run.phase === 'done'}🏁{:else}Aufgabe <strong>{run.index + 1}/{quiz.tasks.length}</strong>{/if}
    </span>
    <span class="money">{formatEuro(totalMoney)}{items.length > 0 ? ` + 🎁×${items.length}` : ''}</span>
    <span title="Verbleibende Joker">📞×{run.jokersLeft.askFriend} 🔁×{run.jokersLeft.twoTries}</span>
    <button class="btn small ghost" onclick={restart} title="Neu starten">↺</button>
  </div>

  {#if run.phase === 'intro' && task && cat}
    <div class="card" style="text-align: center">
      <div style="font-size: 3.5rem">{cat.icon}</div>
      <h2>{cat.name}</h2>
      <p class="muted">{cat.description}</p>
    </div>

    {#if task.reward.kind === 'item'}
      <div class="card" style="text-align: center">
        <p>Bei dieser Aufgabe gibt es zu gewinnen:</p>
        <h3>🎁 {task.reward.label || 'Überraschung'}</h3>
        <button class="btn primary full" onclick={startItemTask}>Aufgabe zeigen</button>
      </div>
    {:else}
      <p class="judge-hint">Wie viel willst du riskieren?</p>
      <div class="tier-btns">
        {#each TIER_IDS as tierId (tierId)}
          <button class="btn tier" onclick={() => chooseTier(tierId)}>
            <strong>{TIER_LABELS[tierId]}</strong>
            <span class="tier-values">
              sicher {formatEuro(quiz.tiers[tierId].base)}<br />
              Gewinn {formatEuro(quiz.tiers[tierId].win)}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  {:else if run.phase === 'question' && task && cat}
    <div class="row">
      {#each JOKER_IDS as joker (joker)}
        {#if cat.supportedJokers.includes(joker)}
          <button
            class="btn small"
            disabled={run.active[joker] || run.jokersLeft[joker] <= 0}
            onclick={() => useJoker(joker)}
          >
            {JOKER_LABELS[joker]} ({run.jokersLeft[joker]})
          </button>
        {/if}
      {/each}
      {#if task.reward.kind === 'money' && run.tier}
        <span class="badge">Einsatz: {TIER_LABELS[run.tier]}</span>
      {/if}
    </div>

    {#if run.active.askFriend}
      <p class="hint">📞 Ein Freund darf helfen!</p>
    {/if}
    {#if run.active.twoTries}
      <p class="hint">🔁 Zwei Versuche aktiv</p>
    {/if}

    <div class="card">
      {#key run.index}
        <cat.Player config={task.config} seed={`${quiz.seed}:${task.id}`} {maxAttempts} onResult={handleResult} />
      {/key}
    </div>
  {:else if run.phase === 'result' && lastResult}
    <div class="card result-banner">
      <div class="big">{lastResult.correct ? '🎉 Richtig!' : '😬 Leider falsch'}</div>
      {#if lastResult.detail}
        <p class="muted">{lastResult.detail}</p>
      {/if}
      {#if lastResult.image}
        <img class="result-img" src={lastResult.image} alt="Auflösung" />
      {/if}
      {#if lastResult.item}
        <p class="payout">🎁 {lastResult.item}</p>
      {:else if lastResult.money > 0}
        <p class="payout">+{formatEuro(lastResult.money)}</p>
      {:else}
        <p class="payout">{formatEuro(0)}</p>
      {/if}
      <button class="btn primary full" onclick={next}>
        {run.index + 1 >= quiz.tasks.length ? '🏁 Zum Ergebnis' : 'Weiter →'}
      </button>
    </div>
  {:else if run.phase === 'done'}
    <div class="card result-banner">
      <div class="big">🏆 Geschafft!</div>
      <p>Dein Gewinn:</p>
      <p class="payout">{formatEuro(totalMoney)}</p>
      {#each items as item}
        <p class="payout">🎁 {item}</p>
      {/each}
    </div>

    <div class="card">
      <h3>Verlauf</h3>
      <table class="summary">
        <tbody>
          {#each run.results as r, i (i)}
            <tr>
              <td>{taskIcon(r.taskId)} Aufgabe {i + 1}{r.tier ? ` (${TIER_LABELS[r.tier]})` : ''}</td>
              <td>{r.correct ? '✅' : '❌'}</td>
              <td>{r.item ? `🎁 ${r.item}` : formatEuro(r.money)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="row">
      <button class="btn primary" onclick={restart}>↺ Nochmal spielen</button>
      <button class="btn" onclick={() => navigate('/')}>Zur Übersicht</button>
    </div>
  {/if}
{/if}

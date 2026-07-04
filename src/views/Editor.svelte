<script lang="ts">
  import {
    autoTiers,
    formatEuro,
    uid,
    JOKER_LABELS,
    TIER_IDS,
    TIER_LABELS,
    type Quiz,
    type Task,
  } from '../lib/model';
  import { getQuiz, saveQuiz } from '../lib/storage';
  import { createRng } from '../lib/rng';
  import { CATEGORIES, getCategory } from '../lib/categories';
  import { quizToLink } from '../lib/share';
  import { navigate } from '../lib/router';

  let { id }: { id: string } = $props();

  const loaded = getQuiz(id);
  let quiz = $state<Quiz | null>(loaded);

  // Autosave (leicht entprellt), sobald sich irgendetwas am Quiz ändert
  $effect(() => {
    if (!quiz) return;
    const snapshot = JSON.stringify(quiz);
    const t = setTimeout(() => saveQuiz(JSON.parse(snapshot)), 300);
    return () => clearTimeout(t);
  });

  let tierMin = $state(1);
  let tierMax = $state(10);
  let expanded = $state<Record<string, boolean>>({});
  let previewing = $state<Record<string, number>>({});
  let previewResult = $state<Record<string, string>>({});
  let linkCopied = $state(false);

  function applyAutoTiers() {
    if (quiz) quiz.tiers = autoTiers(tierMin, tierMax);
  }

  function addTask(categoryId: string) {
    if (!quiz) return;
    const cat = getCategory(categoryId)!;
    const task: Task = {
      id: uid(),
      categoryId,
      reward: { kind: 'money' },
      config: cat.generate
        ? cat.generate(createRng(`${quiz.seed}:${quiz.tasks.length}`))
        : cat.createDefault(),
    };
    quiz.tasks.push(task);
    expanded[task.id] = true;
  }

  function move(i: number, delta: number) {
    if (!quiz) return;
    const j = i + delta;
    if (j < 0 || j >= quiz.tasks.length) return;
    const arr = quiz.tasks;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  function removeTask(i: number) {
    if (!quiz) return;
    if (!confirm('Aufgabe wirklich löschen?')) return;
    quiz.tasks.splice(i, 1);
  }

  function rerollTask(task: Task) {
    if (!quiz) return;
    const cat = getCategory(task.categoryId);
    if (cat?.generate) {
      task.config = cat.generate(createRng(`${quiz.seed}:${task.id}:${Date.now()}`));
      delete previewResult[task.id];
      if (previewing[task.id]) previewing[task.id]++;
    }
  }

  function rerollAll() {
    if (!quiz) return;
    for (const [i, task] of quiz.tasks.entries()) {
      const cat = getCategory(task.categoryId);
      if (cat?.generate) task.config = cat.generate(createRng(`${quiz.seed}:${i}`));
    }
    previewResult = {};
  }

  function setRewardKind(task: Task, kind: 'money' | 'item') {
    task.reward = kind === 'money' ? { kind: 'money' } : { kind: 'item', label: '' };
  }

  function togglePreview(task: Task) {
    if (previewing[task.id]) {
      delete previewing[task.id];
      delete previewResult[task.id];
    } else {
      previewing[task.id] = 1;
    }
  }

  async function copyLink() {
    if (!quiz) return;
    await navigator.clipboard.writeText(quizToLink(quiz));
    linkCopied = true;
    setTimeout(() => (linkCopied = false), 2000);
  }
</script>

{#if !quiz}
  <div class="card">
    <h2>😕 Quiz nicht gefunden</h2>
    <button class="btn" onclick={() => navigate('/')}>Zur Übersicht</button>
  </div>
{:else}
  <div class="row">
    <button class="btn small ghost" onclick={() => navigate('/')}>← Übersicht</button>
    <div class="spacer"></div>
    <button class="btn small primary" disabled={quiz.tasks.length === 0} onclick={() => navigate(`/play/${quiz.id}`)}>
      ▶️ Spielen
    </button>
  </div>

  <label class="field">
    <span>Quiz-Name</span>
    <input type="text" bind:value={quiz.name} />
  </label>

  <div class="card">
    <h3>⚙️ Einstellungen</h3>

    <div class="field-grid">
      <label class="field">
        <span>Seed <small>(gleicher Seed = gleiche Zufalls-Aufgaben)</small></span>
        <input type="text" bind:value={quiz.seed} />
      </label>
      <div class="field">
        <span>&nbsp;</span>
        <button class="btn full" style="margin: 0" onclick={rerollAll}>🎲 Alle Zufalls-Aufgaben neu würfeln</button>
      </div>
      <label class="field">
        <span>{JOKER_LABELS.askFriend}</span>
        <input type="number" min="0" max="9" bind:value={quiz.jokers.askFriend} />
      </label>
      <label class="field">
        <span>{JOKER_LABELS.twoTries}</span>
        <input type="number" min="0" max="9" bind:value={quiz.jokers.twoTries} />
      </label>
    </div>

    <h3>💶 Einsatz-Stufen</h3>
    <p class="muted">
      Der Spieler wählt vor jeder Aufgabe eine Stufe. „Sicher" gibt es immer, „Gewinn" nur bei richtiger Antwort.
    </p>
    <div class="row">
      <label class="field" style="flex:1">
        <span>Min €</span>
        <input type="number" min="0" step="any" bind:value={tierMin} />
      </label>
      <label class="field" style="flex:1">
        <span>Max €</span>
        <input type="number" min="0" step="any" bind:value={tierMax} />
      </label>
      <button class="btn" onclick={applyAutoTiers}>↻ Stufen berechnen</button>
    </div>
    {#each TIER_IDS as tierId (tierId)}
      <div class="row">
        <strong style="width: 4.5rem">{TIER_LABELS[tierId]}</strong>
        <label class="field" style="flex:1">
          <span>Sicher €</span>
          <input type="number" min="0" step="any" bind:value={quiz.tiers[tierId].base} />
        </label>
        <label class="field" style="flex:1">
          <span>Gewinn €</span>
          <input type="number" min="0" step="any" bind:value={quiz.tiers[tierId].win} />
        </label>
      </div>
    {/each}
  </div>

  <h3>📋 Aufgaben ({quiz.tasks.length})</h3>

  {#each quiz.tasks as task, i (task.id)}
    {@const cat = getCategory(task.categoryId)}
    {#if cat}
      <div class="card">
        <div class="task-header">
          <button class="btn small ghost" onclick={() => (expanded[task.id] = !expanded[task.id])}>
            {expanded[task.id] ? '▾' : '▸'}
          </button>
          <strong>{i + 1}. {cat.icon} {cat.name}</strong>
          {#if task.reward.kind === 'item'}
            <span class="badge item">🎁 {task.reward.label || 'Sachpreis'}</span>
          {:else}
            <span class="badge">💶 Geld-Stufen</span>
          {/if}
          <div class="spacer"></div>
          <button class="btn small" disabled={i === 0} onclick={() => move(i, -1)} title="Nach oben">↑</button>
          <button class="btn small" disabled={i === quiz.tasks.length - 1} onclick={() => move(i, 1)} title="Nach unten">↓</button>
          {#if cat.generate}
            <button class="btn small" onclick={() => rerollTask(task)} title="Neu würfeln">🎲</button>
          {/if}
          <button class="btn small" onclick={() => togglePreview(task)} title="Vorschau">👁️</button>
          <button class="btn small ghost" onclick={() => removeTask(i)} title="Löschen">🗑️</button>
        </div>

        {#if expanded[task.id]}
          <div class="field">
            <span>Belohnung</span>
            <div class="row">
              <label class="field checkbox" style="margin:0">
                <input
                  type="radio"
                  name={`reward-${task.id}`}
                  checked={task.reward.kind === 'money'}
                  onchange={() => setRewardKind(task, 'money')}
                />
                <span>💶 Geld-Stufen</span>
              </label>
              <label class="field checkbox" style="margin:0">
                <input
                  type="radio"
                  name={`reward-${task.id}`}
                  checked={task.reward.kind === 'item'}
                  onchange={() => setRewardKind(task, 'item')}
                />
                <span>🎁 Sachpreis</span>
              </label>
              {#if task.reward.kind === 'item'}
                <input type="text" style="flex:1" bind:value={task.reward.label} placeholder="z. B. 1 Tüte Gummibärchen" />
              {/if}
            </div>
          </div>
          <cat.Editor config={task.config} />
        {/if}

        {#if previewing[task.id]}
          <div class="card" style="background: var(--bg)">
            <p class="muted">Vorschau (zählt nicht):</p>
            {#key `${task.id}:${previewing[task.id]}`}
              <cat.Player
                config={task.config}
                seed={`${quiz.seed}:${task.id}`}
                maxAttempts={2}
                preview={true}
                onResult={(correct, detail) =>
                  (previewResult[task.id] = `${correct ? '✅ richtig' : '❌ falsch'}${detail ? ` – ${detail}` : ''}`)}
              />
            {/key}
            {#if previewResult[task.id]}
              <p><strong>{previewResult[task.id]}</strong></p>
              <button class="btn small" onclick={() => { previewing[task.id]++; delete previewResult[task.id]; }}>
                ↻ Vorschau zurücksetzen
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  {/each}

  <div class="card">
    <h3>➕ Aufgabe hinzufügen</h3>
    <div class="row">
      {#each CATEGORIES as cat (cat.id)}
        <button class="btn" onclick={() => addTask(cat.id)}>{cat.icon} {cat.name}</button>
      {/each}
    </div>
  </div>

  <div class="card">
    <h3>🔗 Aufs Handy bringen</h3>
    <p class="muted">
      Link kopieren und z.&nbsp;B. per Messenger aufs Handy schicken – dort öffnen, fertig. Das Quiz steckt komplett im
      Link.
    </p>
    <button class="btn primary full" onclick={copyLink}>{linkCopied ? '✅ Kopiert!' : '🔗 Quiz-Link kopieren'}</button>
    <input type="text" readonly value={quizToLink(quiz)} onfocus={(e) => e.currentTarget.select()} />
  </div>

  <p class="muted">
    Übersicht: {quiz.tasks.length} Aufgaben · Stufen {formatEuro(quiz.tiers.small.base)}–{formatEuro(quiz.tiers.big.win)}
    · Joker: {quiz.jokers.askFriend}× 📞, {quiz.jokers.twoTries}× 🔁
  </p>
{/if}

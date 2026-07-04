<script lang="ts">
  import { createQuiz, uid, type Quiz } from '../lib/model';
  import { deleteQuiz, loadQuizzes, loadRun, saveQuiz } from '../lib/storage';
  import { quizToLink } from '../lib/share';
  import { createDemoQuiz } from '../lib/demo';
  import { navigate } from '../lib/router';

  let quizzes = $state<Quiz[]>(loadQuizzes());
  let copiedId = $state<string | null>(null);

  function newQuiz() {
    const quiz = createQuiz();
    saveQuiz(quiz);
    navigate(`/edit/${quiz.id}`);
  }

  function loadDemo() {
    const quiz = createDemoQuiz();
    saveQuiz(quiz);
    navigate(`/edit/${quiz.id}`);
  }

  function duplicate(quiz: Quiz) {
    const copy: Quiz = structuredClone(quiz);
    copy.id = uid();
    copy.name = `${quiz.name} (Kopie)`;
    saveQuiz(copy);
    quizzes = loadQuizzes();
  }

  function remove(quiz: Quiz) {
    if (!confirm(`Quiz „${quiz.name}" wirklich löschen?`)) return;
    deleteQuiz(quiz.id);
    quizzes = loadQuizzes();
  }

  async function copyLink(quiz: Quiz) {
    await navigator.clipboard.writeText(quizToLink(quiz));
    copiedId = quiz.id;
    setTimeout(() => (copiedId = null), 2000);
  }

  function runLabel(quiz: Quiz): string {
    const run = loadRun(quiz.id);
    return run && run.phase !== 'done' && run.index > 0 ? '▶️ Fortsetzen' : '▶️ Spielen';
  }
</script>

<h1>🎉 Party-Quiz</h1>

<div class="row">
  <button class="btn primary" onclick={newQuiz}>➕ Neues Quiz</button>
  <button class="btn" onclick={loadDemo}>✨ Beispiel-Quiz laden</button>
</div>

{#if quizzes.length === 0}
  <p class="muted">Noch keine Quizze – erstelle eins oder lade das Beispiel-Quiz.</p>
{/if}

{#each quizzes as quiz (quiz.id)}
  <div class="card">
    <h3>{quiz.name}</h3>
    <p class="muted">{quiz.tasks.length} Aufgaben</p>
    <div class="row">
      <button class="btn primary" disabled={quiz.tasks.length === 0} onclick={() => navigate(`/play/${quiz.id}`)}>
        {runLabel(quiz)}
      </button>
      <button class="btn" onclick={() => navigate(`/edit/${quiz.id}`)}>✏️ Bearbeiten</button>
      <button class="btn" onclick={() => copyLink(quiz)}>{copiedId === quiz.id ? '✅ Kopiert!' : '🔗 Link'}</button>
      <button class="btn" onclick={() => duplicate(quiz)} title="Duplizieren">⧉</button>
      <button class="btn ghost" onclick={() => remove(quiz)} title="Löschen">🗑️</button>
    </div>
  </div>
{/each}

<p class="muted" style="margin-top: 2rem">
  💡 Quiz am PC erstellen, mit „🔗 Link" kopieren und auf dem Handy öffnen – fertig.
</p>

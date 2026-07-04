<script lang="ts">
  import { quizFromParam } from '../lib/share';
  import { saveQuiz } from '../lib/storage';
  import { navigate } from '../lib/router';

  let { q }: { q: string } = $props();

  const quiz = quizFromParam(q);
  if (quiz) saveQuiz(quiz);
</script>

{#if quiz}
  <div class="card" style="text-align: center">
    <h2>📥 Quiz importiert!</h2>
    <h3>{quiz.name}</h3>
    <p class="muted">{quiz.tasks.length} Aufgaben</p>
    <div class="row" style="justify-content: center">
      <button class="btn primary" disabled={quiz.tasks.length === 0} onclick={() => navigate(`/play/${quiz.id}`)}>
        ▶️ Jetzt spielen
      </button>
      <button class="btn" onclick={() => navigate(`/edit/${quiz.id}`)}>✏️ Bearbeiten</button>
      <button class="btn" onclick={() => navigate('/')}>Zur Übersicht</button>
    </div>
  </div>
{:else}
  <div class="card">
    <h2>😕 Ungültiger Link</h2>
    <p>Der Quiz-Link konnte nicht gelesen werden.</p>
    <button class="btn" onclick={() => navigate('/')}>Zur Übersicht</button>
  </div>
{/if}

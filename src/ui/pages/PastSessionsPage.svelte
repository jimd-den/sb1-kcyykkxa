<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { Session } from '../../core/entities/Session';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  const sessionService = DependencyContainer.getInstance().getSessionService();
  const dispatch = createEventDispatcher();
  
  let sessions: Session[] = [];
  let isLoading = true;
  let error = '';
  
  onMount(async () => {
    await loadSessions();
  });
  
  async function loadSessions() {
    isLoading = true;
    error = '';
    
    try {
      sessions = await sessionService.getAllSessions();
      // Sort by start time, newest first
      sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    } catch (err) {
      console.error('Error loading sessions:', err);
      error = err instanceof Error ? err.message : 'Failed to load sessions';
    } finally {
      isLoading = false;
    }
  }
  
  function viewSessionDetails(sessionId: string) {
    dispatch('viewSession', { sessionId });
  }
  
  function formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
  
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  function startNewSession() {
    dispatch('startNewSession');
  }
</script>

<div class="past-sessions-page">
  <h1>Your Sessions</h1>
  
  <div class="actions">
    <button class="new-session-button" on:click={startNewSession}>
      Start New Session
    </button>
  </div>
  
  {#if isLoading}
    <div class="loading">Loading sessions...</div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={loadSessions}>Retry</button>
    </div>
  {:else if sessions.length === 0}
    <div class="no-sessions">
      <p>You haven't created any sessions yet.</p>
      <button on:click={startNewSession}>Start Your First Session</button>
    </div>
  {:else}
    <div class="sessions-list">
      {#each sessions as session}
        <div class="session-card" on:click={() => viewSessionDetails(session.sessionId)}>
          <div class="session-header">
            <h3>{session.title}</h3>
            <span class="session-date">{formatDate(session.startTime)}</span>
          </div>
          <div class="session-details">
            <div class="session-time">
              Started: {formatTime(session.startTime)}
              {#if session.endTime}
                <br>Ended: {formatTime(session.endTime)}
              {/if}
              }
            </div>
            <div class="session-goal">
              Goal: {session.goalTime} minutes
            </div>
            <div class="session-comments">
              {session.comments.length} comments
            </div>
          </div>
        </div>
      {/each}
      }
    </div>
  {/if}
  }
</div>

<style>
  .past-sessions-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }
  
  .new-session-button {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .no-sessions {
    text-align: center;
    padding: 3rem 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .no-sessions p {
    margin-bottom: 1rem;
    color: #666;
  }
  
  .sessions-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .session-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .session-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
  
  .session-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .session-date {
    font-size: 0.8rem;
    color: #666;
  }
  
  .session-details {
    font-size: 0.9rem;
    color: #444;
  }
  
  .session-time, .session-goal {
    margin-bottom: 0.5rem;
  }
  
  .session-comments {
    font-style: italic;
  }
</style>
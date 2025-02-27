<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { SessionStatus } from '../../core/entities/Session';
  import type { Session, Comment } from '../../core/entities/Session';
  import SessionTimer from '../components/SessionTimer.svelte';
  import CommentList from '../components/CommentList.svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let sessionId: string;
  
  const sessionService = DependencyContainer.getInstance().getSessionService();
  const dispatch = createEventDispatcher();
  
  let session: Session | null = null;
  let commentText = '';
  let isLoading = true;
  let error = '';
  let addingComment = false;
  
  onMount(async () => {
    await loadSession();
  });
  
  async function loadSession() {
    isLoading = true;
    error = '';
    
    try {
      session = await sessionService.getSessionDetails(sessionId);
    } catch (err) {
      console.error('Error loading session:', err);
      error = err instanceof Error ? err.message : 'Failed to load session';
    } finally {
      isLoading = false;
    }
  }
  
  async function addComment() {
    if (!commentText.trim() || !session) {
      return;
    }
    
    addingComment = true;
    
    try {
      await sessionService.addComment(sessionId, commentText);
      commentText = '';
      await loadSession();
    } catch (err) {
      console.error('Error adding comment:', err);
      error = err instanceof Error ? err.message : 'Failed to add comment';
    } finally {
      addingComment = false;
    }
  }
  
  async function togglePause() {
    if (!session) return;
    
    try {
      if (session.sessionStatus === SessionStatus.IN_PROGRESS) {
        session = await sessionService.pauseSession(sessionId);
      } else if (session.sessionStatus === SessionStatus.PAUSED) {
        session = await sessionService.resumeSession(sessionId);
      }
    } catch (err) {
      console.error('Error toggling pause:', err);
      error = err instanceof Error ? err.message : 'Failed to update session';
    }
  }
  
  function endSession() {
    dispatch('endSession', { sessionId });
  }
</script>

<div class="session-in-progress">
  {#if isLoading}
    <div class="loading">Loading session...</div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={loadSession}>Retry</button>
    </div>
  {:else if session}
    <h1>{session.title}</h1>
    
    <SessionTimer 
      startTime={session.startTime} 
      status={session.sessionStatus} 
      goalTimeMinutes={session.goalTime} 
    />
    
    <div class="session-controls">
      <button 
        class="pause-button" 
        on:click={togglePause}
      >
        {session.sessionStatus === SessionStatus.PAUSED ? 'Resume' : 'Pause'}
      </button>
      
      <button 
        class="end-button" 
        on:click={endSession}
      >
        End Session
      </button>
    </div>
    
    <div class="comment-section">
      <div class="add-comment">
        <textarea 
          bind:value={commentText} 
          placeholder="Add a comment..." 
          disabled={addingComment || session.sessionStatus === SessionStatus.PAUSED}
        ></textarea>
        <button 
          on:click={addComment} 
          disabled={!commentText.trim() || addingComment || session.sessionStatus === SessionStatus.PAUSED}
        >
          Add
        </button>
      </div>
      
      <CommentList comments={session.comments} />
    </div>
  {/if}
  }
</div>

<style>
  .session-in-progress {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
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
  
  .session-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .pause-button, .end-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .pause-button {
    background-color: #f0ad4e;
    color: white;
  }
  
  .end-button {
    background-color: #d9534f;
    color: white;
  }
  
  .comment-section {
    margin-top: 2rem;
  }
  
  .add-comment {
    display: flex;
    margin-bottom: 1rem;
  }
  
  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    resize: vertical;
    min-height: 80px;
  }
  
  .add-comment button {
    padding: 0.75rem 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
  }
  
  .add-comment button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
</style>
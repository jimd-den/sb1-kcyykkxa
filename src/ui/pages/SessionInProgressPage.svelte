<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { SessionStatus } from '../../core/entities/Session';
  import type { Session, Comment } from '../../core/entities/Session';
  import SessionTimer from '../components/SessionTimer.svelte';
  import CommentList from '../components/CommentList.svelte';
  import CameraCapture from '../components/CameraCapture.svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let sessionId: string;
  
  const sessionService = DependencyContainer.getInstance().getSessionService();
  const dispatch = createEventDispatcher();
  
  let session: Session | null = null;
  let commentText = '';
  let isLoading = true;
  let error = '';
  let addingComment = false;
  let showCamera = false;
  let capturedImage: string | null = null;
  let currentProgress = 0;
  
  // Define keys for the TIMWOODS comments
  type TimwoodsKey = 'transportation' | 'inventory' | 'motion' | 'waiting' | 
                     'overproduction' | 'overprocessing' | 'defects' | 'skills';
  
  // TIMWOODS preset comments
  const timwoodsComments: Record<TimwoodsKey, string> = {
    transportation: "Transportation waste identified",
    inventory: "Inventory waste identified",
    motion: "Motion waste identified",
    waiting: "Waiting waste identified",
    overproduction: "Overproduction waste identified",
    overprocessing: "Overprocessing waste identified",
    defects: "Defects waste identified",
    skills: "Skills waste identified"
  };
  
  // Progress percentages
  const progressOptions = [5, 10, 25];
  
  onMount(async () => {
    await loadSession();
  });
  
  async function loadSession() {
    isLoading = true;
    error = '';
    
    try {
      session = await sessionService.getSessionDetails(sessionId);
      
      // Set initial progress by scanning existing comments
      if (session?.comments) {
        const progressRegex = /(\d+)% of task completed/;
        for (const comment of session.comments) {
          const match = comment.text.match(progressRegex);
          if (match && match[1]) {
            const progress = parseInt(match[1], 10);
            if (!isNaN(progress) && progress > currentProgress) {
              currentProgress = progress;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading session:', err);
      error = err instanceof Error ? err.message : 'Failed to load session';
    } finally {
      isLoading = false;
    }
  }
  
  async function addComment(text = commentText, picture = capturedImage) {
    if ((!text || !text.trim()) && !picture) {
      return;
    }
    
    addingComment = true;
    
    try {
      await sessionService.addComment(sessionId, text || '', picture || undefined);
      commentText = '';
      capturedImage = null;
      showCamera = false;
      await loadSession();
    } catch (err) {
      console.error('Error adding comment:', err);
      error = err instanceof Error ? err.message : 'Failed to add comment';
    } finally {
      addingComment = false;
    }
  }
  
  function handleImageCapture(event: { detail: { imageData: string } }) {
    capturedImage = event.detail.imageData;
    showCamera = false;
  }
  
  function cancelImageCapture() {
    capturedImage = null;
    showCamera = false;
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
  
  function addProgressComment(percentage: number) {
    // Update the current progress
    currentProgress = percentage;
    addComment(`${percentage}% of task completed (${percentage}/100)`);
  }
  
  function addTimwoodsComment(wasteType: TimwoodsKey) {
    addComment(timwoodsComments[wasteType]);
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
    
    <div class="progress-section">
      <h3>Progress Tracker ({currentProgress}%)</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {currentProgress}%;"></div>
      </div>
      <div class="progress-buttons">
        {#each progressOptions as percentage}
          <button 
            class="progress-button"
            on:click={() => addProgressComment(percentage)}
            disabled={session.sessionStatus === SessionStatus.PAUSED}
          >
            {percentage}%
          </button>
        {/each}
      </div>
    </div>
    
    <div class="timwoods-section">
      <h3>Six Sigma TIMWOODS</h3>
      <div class="timwoods-buttons">
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('transportation')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Transportation
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('inventory')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Inventory
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('motion')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Motion
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('waiting')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Waiting
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('overproduction')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Overproduction
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('overprocessing')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Overprocessing
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('defects')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Defects
        </button>
        <button 
          class="timwoods-button"
          on:click={() => addTimwoodsComment('skills')}
          disabled={session.sessionStatus === SessionStatus.PAUSED}
        >
          Skills
        </button>
      </div>
    </div>
    
    <div class="comment-section">
      {#if showCamera}
        <div class="camera-wrapper">
          <h3>Add Photo to Comment</h3>
          <CameraCapture 
            on:capture={handleImageCapture}
            on:skip={cancelImageCapture}
            optional={true}
            autoStart={true}
          />
          <button class="cancel-button" on:click={cancelImageCapture}>
            Cancel
          </button>
        </div>
      {:else}
        <div class="add-comment">
          <div class="comment-input-container">
            <textarea 
              bind:value={commentText} 
              placeholder="Add a comment..." 
              disabled={addingComment || session.sessionStatus === SessionStatus.PAUSED}
            ></textarea>
            
            {#if capturedImage}
              <div class="image-preview">
                <img src={capturedImage} alt="Captured" />
                <button class="remove-image" on:click={() => capturedImage = null}>×</button>
              </div>
            {/if}
            
            <div class="comment-actions">
              <button 
                class="add-image-button"
                on:click={() => showCamera = true}
                disabled={addingComment || session.sessionStatus === SessionStatus.PAUSED}
              >
                📷 Add Image
              </button>
              
              <button 
                class="add-comment-button"
                on:click={() => addComment()}
                disabled={((!commentText.trim() && !capturedImage)) || addingComment || session.sessionStatus === SessionStatus.PAUSED}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      {/if}
      
      <CommentList comments={session.comments} />
    </div>
  {/if}
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
  
  h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
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
  
  .progress-section, .timwoods-section {
    margin-top: 1.5rem;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .progress-fill {
    height: 100%;
    background-color: #28a745;
    transition: width 0.3s ease;
  }
  
  .progress-buttons, .timwoods-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .progress-button {
    flex: 1 0 auto;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #5bc0de;
    color: white;
    cursor: pointer;
  }
  
  .progress-button:hover {
    background-color: #46b8da;
  }
  
  .timwoods-button {
    flex: 1 0 calc(50% - 0.5rem);
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #337ab7;
    color: white;
    cursor: pointer;
    margin-bottom: 0.5rem;
  }
  
  .timwoods-button:hover {
    background-color: #286090;
  }
  
  .comment-section {
    margin-top: 2rem;
  }
  
  .add-comment {
    margin-bottom: 1rem;
  }
  
  .comment-input-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
  }
  
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    min-height: 80px;
  }
  
  .comment-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
  
  .add-image-button {
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .add-comment-button {
    padding: 0.5rem 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-comment-button:disabled, .add-image-button:disabled, 
  .progress-button:disabled, .timwoods-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .camera-wrapper {
    margin-bottom: 1rem;
  }
  
  .cancel-button {
    display: block;
    margin: 1rem auto;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
  }
  
  .image-preview {
    position: relative;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 200px;
    display: block;
    margin: 0 auto;
  }
  
  .remove-image {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: rgba(255, 255, 255, 0.7);
    color: #d9534f;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>
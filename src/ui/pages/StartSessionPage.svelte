<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CameraCapture from '../components/CameraCapture.svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  const sessionService = DependencyContainer.getInstance().getSessionService();
  const dispatch = createEventDispatcher();
  
  let title = '';
  let goalTime = 30; // Default 30 minutes
  let beforePictureData = '';
  let isCreating = false;
  let error = '';
  
  function handleCapture(event: CustomEvent) {
    beforePictureData = event.detail.imageData;
  }
  
  async function startSession() {
    if (!title.trim()) {
      error = 'Please enter a session title';
      return;
    }
    
    if (goalTime <= 0) {
      error = 'Goal time must be greater than zero';
      return;
    }
    
    if (!beforePictureData) {
      error = 'Please take a before picture';
      return;
    }
    
    error = '';
    isCreating = true;
    
    try {
      const session = await sessionService.startSession(title, goalTime, beforePictureData);
      dispatch('sessionStarted', { sessionId: session.sessionId });
    } catch (err) {
      console.error('Error starting session:', err);
      error = err instanceof Error ? err.message : 'Failed to start session';
    } finally {
      isCreating = false;
    }
  }
</script>

<div class="start-session-page">
  <h1>Start New Session</h1>
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  
  <div class="form-group">
    <label for="title">Session Title</label>
    <input 
      type="text" 
      id="title" 
      bind:value={title} 
      placeholder="Enter session title"
      disabled={isCreating}
    />
  </div>
  
  <div class="form-group">
    <label for="goalTime">Goal Time (minutes)</label>
    <input 
      type="number" 
      id="goalTime" 
      bind:value={goalTime} 
      min="1" 
      max="240"
      disabled={isCreating}
    />
  </div>
  
  <div class="form-group">
    <label>Before Picture</label>
    {#if beforePictureData}
      <div class="picture-preview">
        <img src={beforePictureData} alt="Before" />
        <button class="retake-button" on:click={() => beforePictureData = ''} disabled={isCreating}>
          Retake
        </button>
      </div>
    {:else}
      <CameraCapture on:capture={handleCapture} />
    {/if}
  
  </div>
  
  <div class="form-actions">
    <button 
      class="start-button" 
      on:click={startSession} 
      disabled={isCreating || !title || !beforePictureData}
    >
      {isCreating ? 'Starting...' : 'Start Session'}
    </button>
  </div>
</div>

<style>
  .start-session-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .picture-preview {
    position: relative;
  }
  
  .picture-preview img {
    width: 100%;
    border-radius: 8px;
  }
  
  .retake-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .form-actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  
  .start-button {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .start-button:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  .start-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
</style>
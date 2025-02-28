<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import CameraCapture from '../components/CameraCapture.svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let sessionId: string;
  
  const sessionService = DependencyContainer.getInstance().getSessionService();
  const dispatch = createEventDispatcher();
  
  let afterPictureData = '';
  let isEnding = false;
  let error = '';
  
  function handleCapture(event: CustomEvent) {
    afterPictureData = event.detail.imageData;
  }
  
  function handleSkip() {
    afterPictureData = '';
  }
  
  async function completeSession() {
    error = '';
    isEnding = true;
    
    try {
      await sessionService.endSession(sessionId, afterPictureData);
      dispatch('sessionEnded', { sessionId });
    } catch (err) {
      console.error('Error ending session:', err);
      error = err instanceof Error ? err.message : 'Failed to end session';
    } finally {
      isEnding = false;
    }
  }
  
  function continueSession() {
    dispatch('continueSession', { sessionId });
  }
</script>

<div class="end-session-page">
  <h1>Complete Your Session</h1>
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  <div class="form-group">
    <label>After Picture (Optional)</label>
    {#if afterPictureData}
      <div class="picture-preview">
        <img src={afterPictureData} alt="After" />
        <button class="retake-button" on:click={() => afterPictureData = ''} disabled={isEnding}>
          Retake
        </button>
      </div>
    {:else}
      <CameraCapture 
        on:capture={handleCapture}
        on:skip={handleSkip}
        optional={true}
      />
    {/if}
  </div>
  
  <div class="form-actions">
    <button 
      class="continue-button" 
      on:click={continueSession} 
      disabled={isEnding}
    >
      Continue Session
    </button>
    
    <button 
      class="complete-button" 
      on:click={completeSession} 
      disabled={isEnding}
    >
      {isEnding ? 'Completing...' : 'Complete Session'}
    </button>
  </div>
</div>

<style>
  .end-session-page {
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
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .complete-button {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .complete-button:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  .continue-button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .continue-button:hover:not(:disabled) {
    background-color: #0069d9;
  }
  
  .complete-button:disabled, .continue-button:disabled {
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
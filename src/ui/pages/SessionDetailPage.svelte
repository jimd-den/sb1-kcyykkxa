<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { Session, Picture } from '../../core/entities/Session';
  import { SessionStatus } from '../../core/entities/Session';
  import CommentList from '../components/CommentList.svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let sessionId: string;
  
  const sessionService = DependencyContainer.getInstance().getSessionService();
  const dispatch = createEventDispatcher();
  
  let session: Session | null = null;
  let beforePicture: Picture | null = null;
  let afterPicture: Picture | null = null;
  let isLoading = true;
  let error = '';
  
  onMount(async () => {
    await loadSessionDetails();
  });
  
  async function loadSessionDetails() {
    isLoading = true;
    error = '';
    
    try {
      session = await sessionService.getSessionDetails(sessionId);
      
      if (session.beforePictureId) {
        beforePicture = await sessionService.getPicture(session.beforePictureId);
      }
      
      if (session.afterPictureId) {
        afterPicture = await sessionService.getPicture(session.afterPictureId);
      }
    } catch (err) {
      console.error('Error loading session details:', err);
      error = err instanceof Error ? err.message : 'Failed to load session details';
    } finally {
      isLoading = false;
    }
  }
  
  function formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  function calculateDuration(startTime: Date, endTime?: Date): string {
    const end = endTime || new Date();
    const durationMs = end.getTime() - startTime.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
  
  function goBack() {
    dispatch('back');
  }
</script>

<div class="session-detail-page">
  <button class="back-button" on:click={goBack}>← Back to Sessions</button>
  
  {#if isLoading}
    <div class="loading">Loading session details...</div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={loadSessionDetails}>Retry</button>
    </div>
  {:else if session}
    <h1>{session.title}</h1>
    
    <div class="session-info">
      <div class="info-item">
        <span class="label">Started:</span>
        <span class="value">{formatDate(session.startTime)}</span>
      </div>
      
      {#if session.endTime}
        <div class="info-item">
          <span class="label">Ended:</span>
          <span class="value">{formatDate(session.endTime)}</span>
        </div>
      {/if}
      }
      
      <div class="info-item">
        <span class="label">Duration:</span>
        <span class="value">{calculateDuration(session.startTime, session.endTime)}</span>
      </div>
      
      <div class="info-item">
        <span class="label">Goal Time:</span>
        <span class="value">{session.goalTime} minutes</span>
      </div>
      
      <div class="info-item">
        <span class="label">Status:</span>
        <span class="value status-badge" class:in-progress={session.sessionStatus === SessionStatus.IN_PROGRESS} class:paused={session.sessionStatus === SessionStatus.PAUSED} class:ended={session.sessionStatus === SessionStatus.ENDED}>
          {session.sessionStatus.replace('_', ' ')}
        </span>
      </div>
    </div>
    
    <div class="pictures-container">
      <div class="picture-box">
        <h3>Before</h3>
        {#if beforePicture}
          <img src={beforePicture.pictureData} alt="Before" />
        {:else}
          <div class="no-picture">No before picture available</div>
        {/if}
      
      </div>
      
      <div class="picture-box">
        <h3>After</h3>
        {#if afterPicture}
          <img src={afterPicture.pictureData} alt="After" />
        {:else}
          <div class="no-picture">No after picture available</div>
        {/if}
      </div>
    </div>
    
    <div class="comments-container">
      <CommentList comments={session.comments} />
    </div>
  {/if}
</div>

<style>
  .session-detail-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .back-button {
    background: none;
    border: none;
    color: #4caf50;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    margin-bottom: 1rem;
    display: inline-block;
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
  
  .session-info {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-weight: bold;
    width: 100px;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  .in-progress {
    background-color: #4caf50;
    color: white;
  }
  
  .paused {
    background-color: #f0ad4e;
    color: white;
  }
  
  .ended {
    background-color: #5bc0de;
    color: white;
  }
  
  .pictures-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .picture-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .picture-box h3 {
    background-color: #f5f5f5;
    margin: 0;
    padding: 0.5rem;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  
  .picture-box img {
    width: 100%;
    display: block;
  }
  
  .no-picture {
    padding: 2rem;
    text-align: center;
    color: #888;
    background-color: #f9f9f9;
  }
  
  .comments-container {
    margin-top: 2rem;
  }
  
  @media (max-width: 600px) {
    .pictures-container {
      grid-template-columns: 1fr;
    }
  }
</style>
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { SessionStatus } from '../../core/entities/Session';
  
  export let startTime: Date;
  export let endTime: Date | undefined = undefined;
  export let status: SessionStatus;
  export let goalTimeMinutes: number;
  
  let elapsed = '00:00:00';
  let progress = 0;
  let intervalId: number;
  
  function updateTimer() {
    if (status === SessionStatus.ENDED && endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      updateDisplay(durationMs);
    } else if (status !== SessionStatus.ENDED) {
      const now = new Date();
      const durationMs = now.getTime() - startTime.getTime();
      updateDisplay(durationMs);
    }
  }
  
  function updateDisplay(durationMs: number) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    elapsed = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Calculate progress as percentage of goal time
    const goalTimeMs = goalTimeMinutes * 60 * 1000;
    progress = Math.min(100, (durationMs / goalTimeMs) * 100);
  }
  
  onMount(() => {
    updateTimer();
    if (status !== SessionStatus.ENDED) {
      intervalId = setInterval(updateTimer, 1000);
    }
  });
  
  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
  
  $: if (status === SessionStatus.PAUSED && intervalId) {
    clearInterval(intervalId);
    intervalId = 0;
  } else if (status === SessionStatus.IN_PROGRESS && !intervalId) {
    updateTimer();
    intervalId = setInterval(updateTimer, 1000);
  } else if (status === SessionStatus.ENDED && intervalId) {
    clearInterval(intervalId);
    intervalId = 0;
    updateTimer();
  }
</script>

<div class="timer-container">
  <div class="timer">{elapsed}</div>
  <div class="progress-container">
    <div class="progress-bar" style="width: {progress}%"></div>
  </div>
  <div class="goal-time">Goal: {goalTimeMinutes} minutes</div>
</div>

<style>
  .timer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem 0;
  }
  
  .timer {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .progress-container {
    width: 100%;
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }
  
  .goal-time {
    font-size: 0.9rem;
    color: #666;
  }
</style>
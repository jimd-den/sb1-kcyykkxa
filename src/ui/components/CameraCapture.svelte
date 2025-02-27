<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let autoStart = true;
  
  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let cameraInitialized = false;
  let cameraError = '';
  
  const cameraService = DependencyContainer.getInstance().getCameraService();
  const dispatch = createEventDispatcher();
  
  onMount(async () => {
    if (autoStart) {
      await startCamera();
    }
  });
  
  onDestroy(() => {
    stopCamera();
  });
  
  async function startCamera() {
    try {
      cameraError = '';
      await cameraService.initialize(videoElement);
      cameraInitialized = true;
    } catch (error) {
      cameraError = 'Could not access camera. Please ensure you have granted camera permissions.';
      console.error(error);
    }
  }
  
  function stopCamera() {
    if (cameraInitialized) {
      cameraService.stopCamera();
      cameraInitialized = false;
    }
  }
  
  function takePicture() {
    if (!cameraInitialized) {
      return;
    }
    
    try {
      const imageData = cameraService.takePicture(canvasElement);
      dispatch('capture', { imageData });
    } catch (error) {
      console.error('Error taking picture:', error);
      cameraError = 'Failed to capture image';
    }
  }
</script>

<div class="camera-container">
  {#if cameraError}
    <div class="camera-error">
      <p>{cameraError}</p>
      <button on:click={startCamera}>Retry</button>
    </div>
  {:else}
    <video bind:this={videoElement} autoplay playsinline></video>
    <canvas bind:this={canvasElement} style="display: none;"></canvas>
    
    <div class="camera-controls">
      <button class="capture-button" on:click={takePicture} disabled={!cameraInitialized}>
        Take Photo
      </button>
    </div>
  {/if}
  }
</div>

<style>
  .camera-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    position: relative;
  }
  
  video {
    width: 100%;
    border-radius: 8px;
    background-color: #000;
  }
  
  .camera-controls {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }
  
  .capture-button {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  .capture-button:hover {
    background-color: #45a049;
  }
  
  .capture-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .camera-error {
    padding: 2rem;
    text-align: center;
    background-color: #f8d7da;
    border-radius: 8px;
    color: #721c24;
  }
</style>
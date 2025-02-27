<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let autoStart = true;
  
  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let fileInput: HTMLInputElement;
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

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      cameraError = 'Please select an image file';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        canvasElement.width = img.width;
        canvasElement.height = img.height;
        const ctx = canvasElement.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const imageData = canvasElement.toDataURL('image/jpeg');
        dispatch('capture', { imageData });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    input.value = '';
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
      <div class="upload-control">
        <label for="fileUpload" class="upload-button">
          Upload Photo
        </label>
        <input
          id="fileUpload"
          bind:this={fileInput}
          type="file"
          accept="image/*"
          on:change={handleFileUpload}
        />
      </div>
    </div>
  {/if}
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
    gap: 1rem;
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

  .upload-control {
    position: relative;
  }

  .upload-button {
    display: inline-block;
    background-color: #2196F3;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .upload-button:hover {
    background-color: #1976D2;
  }

  input[type="file"] {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
</style>
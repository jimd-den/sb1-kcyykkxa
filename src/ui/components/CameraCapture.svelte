<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let autoStart = false;
  export let optional = false;
  
  let showCameraOptions = true;
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

  function skipPicture() {
    dispatch('skip');
  }

  function chooseCameraOption() {
    showCameraOptions = false;
    startCamera();
  }

  function chooseUploadOption() {
    showCameraOptions = false;
    cameraInitialized = false;
  }
</script>

<div class="camera-container">
  {#if showCameraOptions}
    <div class="camera-options">
      <h3>Choose an option:</h3>
      <div class="options-buttons">
        <button class="option-button" on:click={chooseCameraOption}>
          Use Camera
        </button>
        <button class="option-button" on:click={chooseUploadOption}>
          Upload Picture
        </button>
        {#if optional}
          <button class="option-button skip-button" on:click={skipPicture}>
            Skip Picture
          </button>
        {/if}
      </div>
    </div>
  {:else if cameraError}
    <div class="camera-error">
      <p>{cameraError}</p>
      <div class="error-buttons">
        <button on:click={startCamera}>Retry Camera</button>
        <button on:click={() => showCameraOptions = true}>Choose Different Option</button>
      </div>
    </div>
  {:else}
    {#if cameraInitialized}
      <video bind:this={videoElement} autoplay playsinline></video>
      <canvas bind:this={canvasElement} style="display: none;"></canvas>
    {/if}
    
    <div class="camera-controls">
      {#if cameraInitialized}
        <button class="capture-button" on:click={takePicture}>
          Take Photo
        </button>
      {/if}
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
      <button class="back-button" on:click={() => showCameraOptions = true}>
        Back
      </button>
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

  .camera-options {
    text-align: center;
    padding: 2rem;
  }

  .options-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
  }

  .option-button {
    padding: 1rem;
    border: none;
    border-radius: 4px;
    background-color: #2196F3;
    color: white;
    cursor: pointer;
    font-size: 1rem;
  }

  .option-button:hover {
    background-color: #1976D2;
  }

  .skip-button {
    background-color: #757575;
  }

  .skip-button:hover {
    background-color: #616161;
  }

  .error-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .back-button {
    background-color: #757575;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .back-button:hover {
    background-color: #616161;
  }
</style>
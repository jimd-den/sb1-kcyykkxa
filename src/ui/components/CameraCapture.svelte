<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { DependencyContainer } from '../../application/di/DependencyContainer';
  
  export let optional = false;
  
  let canvasElement: HTMLCanvasElement;
  let fileInput: HTMLInputElement;
  let mobileInput: HTMLInputElement;
  let cameraError = '';
  let isMobileDevice = false;
  
  const dispatch = createEventDispatcher();
  
  onMount(() => {
    // Check if the device is mobile
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });
  
  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      cameraError = 'Please select an image file';
      return;
    }
    
    processImageFile(file);
    
    // Reset input so the same file can be selected again
    input.value = '';
  }
  
  function processImageFile(file: File) {
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
  }
  
  function skipPicture() {
    dispatch('skip');
  }
  
  function triggerFileInput() {
    if (isMobileDevice) {
      mobileInput.click();
    } else {
      fileInput.click();
    }
  }
</script>

<div class="camera-container">
  <canvas bind:this={canvasElement} style="display: none;"></canvas>
  
  {#if cameraError}
    <div class="camera-error">
      <p>{cameraError}</p>
      <div class="error-buttons">
        <button on:click={() => cameraError = ''}>Try Again</button>
      </div>
    </div>
  {:else}
    <div class="camera-controls">
      <button class="capture-button" on:click={triggerFileInput}>
        {isMobileDevice ? 'Take Photo' : 'Upload Photo'}
      </button>
      
      <!-- Input for mobile devices - uses the device camera app -->
      <input
        bind:this={mobileInput}
        type="file"
        accept="image/*"
        capture="environment"
        on:change={handleFileUpload}
        style="display: none;"
      />
      
      <!-- Input for desktop devices - regular file upload -->
      <input
        id="fileUpload"
        bind:this={fileInput}
        type="file"
        accept="image/*"
        on:change={handleFileUpload}
        style="display: none;"
      />
      
      {#if optional}
        <button class="skip-button" on:click={skipPicture}>
          Skip Picture
        </button>
      {/if}
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
    border-radius: 8px;
    padding: 1rem 2rem;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 1rem;
  }
  
  .capture-button:hover {
    background-color: #45a049;
  }
  
  .camera-error {
    padding: 2rem;
    text-align: center;
    background-color: #f8d7da;
    border-radius: 8px;
    color: #721c24;
  }
  
  .skip-button {
    background-color: #757575;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
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
</style>
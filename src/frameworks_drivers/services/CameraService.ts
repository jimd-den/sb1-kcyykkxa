export class CameraService {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Could not access camera');
    }
  }

  takePicture(canvasElement: HTMLCanvasElement): string {
    if (!this.videoElement || !this.stream) {
      throw new Error('Camera not initialized');
    }

    const context = canvasElement.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions to match video
    canvasElement.width = this.videoElement.videoWidth;
    canvasElement.height = this.videoElement.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(this.videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Get the image data as a base64 string
    return canvasElement.toDataURL('image/jpeg');
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
}
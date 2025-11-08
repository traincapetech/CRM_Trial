// WhatsApp-style notification sounds using Web Audio API
class NotificationSounds {
  constructor() {
    this.audioContext = null;
    this.initializeAudio();
  }

  // Initialize audio context
  initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Resume audio context if suspended
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Create and play a tone
  playTone(frequency, duration, volume = 1.3, type = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // WhatsApp-style message sound (ascending tone)
  async playMessageSound() {
    try {
      await this.resumeAudioContext();
      
      // Two-tone notification similar to WhatsApp
      this.playTone(800, 150, 0.3, 'sine');
      setTimeout(() => {
        this.playTone(1000, 150, 0.3, 'sine');
      }, 100);
    } catch (error) {
      console.error('Error playing message sound:', error);
    }
  }

  // Different sound for group messages (triple tone)
  async playGroupMessageSound() {
    try {
      await this.resumeAudioContext();
      
      // Three-tone notification for group messages
      this.playTone(650, 120, 0.25, 'sine');
      setTimeout(() => {
        this.playTone(800, 120, 0.25, 'sine');
      }, 150);
      setTimeout(() => {
        this.playTone(1000, 120, 0.25, 'sine');
      }, 300);
    } catch (error) {
      console.error('Error playing group message sound:', error);
    }
  }

  // Urgent notification sound (rapid beeps)
  async playUrgentSound() {
    try {
      await this.resumeAudioContext();
      
      // Rapid beeps for urgent notifications
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.playTone(1200, 100, 0.4, 'square');
        }, i * 200);
      }
    } catch (error) {
      console.error('Error playing urgent sound:', error);
    }
  }

  // Soft notification sound (gentle tone)
  async playSoftSound() {
    try {
      await this.resumeAudioContext();
      
      // Gentle single tone
      this.playTone(600, 300, 0.2, 'sine');
    } catch (error) {
      console.error('Error playing soft sound:', error);
    }
  }

  // Success sound (ascending chord)
  async playSuccessSound() {
    try {
      await this.resumeAudioContext();
      
      // Ascending chord
      this.playTone(523, 200, 0.15, 'sine'); // C
      setTimeout(() => {
        this.playTone(659, 200, 0.15, 'sine'); // E
      }, 100);
      setTimeout(() => {
        this.playTone(784, 200, 0.15, 'sine'); // G
      }, 200);
    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  }

  // Error sound (descending tone)
  async playErrorSound() {
    try {
      await this.resumeAudioContext();
      
      // Descending tone
      this.playTone(400, 300, 0.3, 'sawtooth');
      setTimeout(() => {
        this.playTone(300, 300, 0.3, 'sawtooth');
      }, 200);
    } catch (error) {
      console.error('Error playing error sound:', error);
    }
  }

  // Test if audio is supported
  isAudioSupported() {
    return !!this.audioContext;
  }

  // Get audio context state
  getAudioState() {
    return this.audioContext ? this.audioContext.state : 'not-supported';
  }
}

// Export singleton instance
export default new NotificationSounds(); 
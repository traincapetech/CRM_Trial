import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import NotificationSounds from '../assets/sounds/notification-sounds.js';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.audioContext = null;
    this.notificationSound = null;
    this.sounds = NotificationSounds;
    this.isAudioEnabled = true;
    this.soundPreferences = {
      messageSound: 'message', // 'message', 'group', 'soft', 'urgent', 'none'
      volume: 0.3,
      enableSounds: true
    };
    this.initializeAudio();
    this.loadPreferences();
  }

  // Load user preferences from localStorage
  loadPreferences() {
    try {
      const saved = localStorage.getItem('notificationPreferences');
      if (saved) {
        this.soundPreferences = { ...this.soundPreferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Error loading notification preferences:', error);
    }
  }

  // Save user preferences to localStorage
  savePreferences() {
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(this.soundPreferences));
    } catch (error) {
      console.warn('Error saving notification preferences:', error);
    }
  }

  // Update sound preferences
  updatePreferences(newPreferences) {
    this.soundPreferences = { ...this.soundPreferences, ...newPreferences };
    this.savePreferences();
  }

  // Initialize audio context and load notification sound
  initializeAudio() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create notification sound using Web Audio API
      this.createNotificationSound();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Create a beep sound using Web Audio API (legacy support)
  createNotificationSound() {
    if (!this.audioContext) return;

    const createBeep = (frequency = 800, duration = 200) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    };

    this.notificationSound = createBeep;
  }

  // Play notification sound based on type
  async playNotificationSound(type = 'message') {
    if (!this.soundPreferences.enableSounds || !this.isAudioEnabled) {
      return;
    }

    try {
      switch (type) {
        case 'message':
          await this.sounds.playMessageSound();
          break;
        case 'group':
          await this.sounds.playGroupMessageSound();
          break;
        case 'urgent':
          await this.sounds.playUrgentSound();
          break;
        case 'soft':
          await this.sounds.playSoftSound();
          break;
        case 'success':
          await this.sounds.playSuccessSound();
          break;
        case 'error':
          await this.sounds.playErrorSound();
          break;
        default:
          await this.sounds.playMessageSound();
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
      
      // Fallback to legacy sound
      this.playLegacySound();
    }
  }

  // Legacy sound support (fallback)
  playLegacySound() {
    try {
      if (this.audioContext && this.notificationSound) {
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        // Play multiple beeps for urgency
        this.notificationSound(800, 300); // First beep
        setTimeout(() => this.notificationSound(1000, 300), 400); // Second beep
        setTimeout(() => this.notificationSound(800, 300), 800); // Third beep
      } else {
        // Fallback: try to play a system beep
        console.log('\u0007'); // Bell character
      }
    } catch (error) {
      console.error('Error playing legacy notification sound:', error);
    }
  }

  // Connect to WebSocket server
  connect(userId) {
    if (this.isConnected && this.userId === userId) {
      return; // Already connected for this user
    }

    this.userId = userId;
    
    // Determine server URL based on environment
    const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
    const apiUrl = isDevelopment ? 'http://localhost:8080/api' : (import.meta.env?.VITE_API_URL || 'https://crm-trial-backend.onrender.com/api');
    const serverUrl = apiUrl.replace('/api', ''); // Remove /api for socket connection

    console.log('🔔 Connecting to notification server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to notification server');
      this.isConnected = true;
      
      // Join user's personal room
      this.socket.emit('join-user-room', userId);
      
      toast.success('🔔 Notifications enabled');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast.error('Failed to connect to notification server');
    });

    // Listen for chat message notifications
    this.socket.on('messageNotification', (notification) => {
      this.handleChatMessageNotification(notification);
    });

    // Listen for exam reminders
    this.socket.on('exam-reminder', (notification) => {
      this.handleExamReminder(notification);
    });

    // Listen for other notification types
    this.socket.on('notification', (notification) => {
      this.handleGeneralNotification(notification);
    });

    // Listen for user status updates
    this.socket.on('userStatusUpdate', (statusUpdate) => {
      this.handleUserStatusUpdate(statusUpdate);
    });
  }

  // Handle chat message notifications
  handleChatMessageNotification(notification) {
    console.log('💬 Chat message notification received:', notification);

    // Determine sound type based on message context
    let soundType = 'message';
    if (notification.isGuest) {
      soundType = 'urgent'; // Guest messages are more urgent
    } else if (notification.isGroup) {
      soundType = 'group'; // Group messages
    }

    // Play notification sound
    this.playNotificationSound(soundType);

    // Show browser notification if permission granted
    this.showBrowserNotification({
      title: `New message from ${notification.senderName}`,
      body: notification.content.substring(0, 100) + (notification.content.length > 100 ? '...' : ''),
      icon: '/favicon.ico',
      tag: 'chat-message',
      data: {
        senderId: notification.senderId,
        senderName: notification.senderName,
        type: 'chat'
      }
    });

    // Show toast notification (only if chat is not open)
    if (!this.isChatWindowOpen()) {
      const toastMessage = notification.isGuest 
        ? `👤 ${notification.senderName}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`
        : `💬 ${notification.senderName}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`;

      toast(toastMessage, {
        icon: notification.isGuest ? '👤' : '💬',
        duration: 5000,
        position: 'top-right',
        style: {
          background: notification.isGuest ? '#fef3c7' : '#f3f4f6',
          color: notification.isGuest ? '#92400e' : '#1f2937',
          border: notification.isGuest ? '1px solid #d97706' : '1px solid #d1d5db'
        },
        onClick: () => {
          // Focus the chat window when toast is clicked
          this.focusChatWindow();
        }
      });
    }
  }

  // Handle exam reminder notifications
  handleExamReminder(notification) {
    console.log('🚨 Exam reminder received:', notification);

    // Play urgent sound for exam reminders
    this.playNotificationSound('urgent');

    // Show browser notification if permission granted
    this.showBrowserNotification({
      title: notification.title,
      body: notification.message,
      icon: '/favicon.ico',
      tag: 'exam-reminder',
      requireInteraction: true,
      data: {
        examId: notification.examDetails?.id,
        type: 'exam'
      }
    });

    // Show toast notification with custom content
    const toastContent = `🚨 ${notification.title}\n\n${notification.message}`;

    toast(toastContent, {
      duration: 30000, // Show for 30 seconds
      position: 'top-center',
      style: {
        background: '#fee2e2',
        border: '2px solid #dc2626',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '400px',
        fontSize: '14px',
        lineHeight: '1.4'
      },
      icon: '🚨'
    });

    // Show modal for critical exam notifications
    this.showExamModal(notification);
  }

  // Handle general notifications
  handleGeneralNotification(notification) {
    console.log('📢 General notification received:', notification);

    // Play appropriate sound based on notification type
    const soundType = notification.urgent ? 'urgent' : 'soft';
    this.playNotificationSound(soundType);

    // Show browser notification
    this.showBrowserNotification({
      title: notification.title || 'CRM Notification',
      body: notification.message,
      icon: '/favicon.ico',
      tag: 'general-notification',
      data: {
        type: 'general'
      }
    });

    // Show toast notification
    toast(notification.message, {
      icon: notification.icon || '📢',
      duration: 5000,
      position: 'top-right',
      style: {
        background: notification.urgent ? '#fee2e2' : '#f3f4f6',
        color: notification.urgent ? '#dc2626' : '#1f2937',
        border: notification.urgent ? '1px solid #dc2626' : '1px solid #d1d5db'
      }
    });
  }

  // Handle user status updates
  handleUserStatusUpdate(statusUpdate) {
    console.log('👤 User status update:', statusUpdate);

    // Play soft sound for status updates (optional)
    if (statusUpdate.status === 'ONLINE' && this.soundPreferences.enableStatusSounds) {
      this.playNotificationSound('soft');
    }

    // Show subtle toast for important status changes
    if (statusUpdate.status === 'ONLINE') {
      toast(`${statusUpdate.userName || 'User'} is now online`, {
        icon: '🟢',
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #0ea5e9'
        }
      });
    }
  }

  // Show browser notification
  showBrowserNotification(options) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'crm-notification',
        requireInteraction: options.requireInteraction || false,
        silent: false,
        data: options.data || {}
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle click based on notification type
        if (options.data?.type === 'chat') {
          this.focusChatWindow();
        } else if (options.data?.type === 'exam' && options.data?.examLink) {
          window.open(options.data.examLink, '_blank');
        }
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  // Check if chat window is open
  isChatWindowOpen() {
    // This would need to be implemented based on your chat window state
    // For now, return false to always show notifications
    return false;
  }

  // Focus the chat window
  focusChatWindow() {
    // Dispatch custom event to focus chat window
    window.dispatchEvent(new CustomEvent('focusChatWindow'));
  }

  // Show exam modal
  showExamModal(notification) {
    // Dispatch custom event to show exam modal
    window.dispatchEvent(new CustomEvent('showExamModal', {
      detail: notification
    }));
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      
      if (permission === 'granted') {
        toast.success('🔔 Browser notifications enabled');
        return true;
      } else if (permission === 'denied') {
        toast.error('🔕 Browser notifications blocked');
        return false;
      }
    }
    return false;
  }

  // Enable/disable audio
  setAudioEnabled(enabled) {
    this.isAudioEnabled = enabled;
    this.updatePreferences({ enableSounds: enabled });
  }

  // Test notification sound
  testNotificationSound(type = 'message') {
    this.playNotificationSound(type);
  }

  // Get current preferences
  getPreferences() {
    return { ...this.soundPreferences };
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.userId = null;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      audioSupported: this.sounds.isAudioSupported(),
      audioState: this.sounds.getAudioState(),
      soundPreferences: this.soundPreferences
    };
  }
}

// Export singleton instance
export default new NotificationService(); 
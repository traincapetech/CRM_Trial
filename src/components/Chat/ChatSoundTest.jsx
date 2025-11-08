import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import notificationService from '../../services/notificationService';
import { 
  FaPlay, 
  FaVolumeUp, 
  FaComment, 
  FaUsers, 
  FaExclamationTriangle, 
  FaMusic,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const ChatSoundTest = ({ isOpen, onClose }) => {
  const { testNotificationSound } = useChat();
  const [lastPlayed, setLastPlayed] = useState('');

  const soundTests = [
    {
      type: 'message',
      name: 'Message Sound',
      icon: FaComment,
      color: '#10b981',
      description: 'Standard WhatsApp-style message notification'
    },
    {
      type: 'group',
      name: 'Group Message',
      icon: FaUsers,
      color: '#3b82f6',
      description: 'Triple tone for group conversations'
    },
    {
      type: 'urgent',
      name: 'Urgent Alert',
      icon: FaExclamationTriangle,
      color: '#ef4444',
      description: 'Rapid beeps for important messages'
    },
    {
      type: 'soft',
      name: 'Soft Notification',
      icon: FaMusic,
      color: '#8b5cf6',
      description: 'Gentle tone for quiet environments'
    },
    {
      type: 'success',
      name: 'Success Sound',
      icon: FaCheckCircle,
      color: '#06d6a0',
      description: 'Message sent confirmation'
    },
    {
      type: 'error',
      name: 'Error Sound',
      icon: FaTimesCircle,
      color: '#f72585',
      description: 'Error or failure notification'
    }
  ];

  const handleTestSound = async (soundType, soundName) => {
    try {
      setLastPlayed(`Testing ${soundName}...`);
      await testNotificationSound(soundType);
      setLastPlayed(`✅ Played: ${soundName}`);
      
      setTimeout(() => {
        setLastPlayed('');
      }, 3000);
    } catch (error) {
      setLastPlayed(`❌ Error playing ${soundName}`);
      console.error('Error testing sound:', error);
    }
  };

  const testBrowserNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🔔 CRM Chat Test', {
          body: 'This is a test browser notification with sound!',
          icon: '/favicon.ico',
          requireInteraction: false
        });
        setLastPlayed('✅ Browser notification sent');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🔔 Permission Granted!', {
              body: 'Browser notifications are now enabled',
              icon: '/favicon.ico'
            });
            setLastPlayed('✅ Permission granted & notification sent');
          } else {
            setLastPlayed('❌ Permission denied');
          }
        });
      } else {
        setLastPlayed('❌ Notifications are blocked');
      }
    } else {
      setLastPlayed('❌ Browser does not support notifications');
    }
  };

  const simulateNewMessage = () => {
    // Simulate receiving a message notification
    const mockNotification = {
      senderId: 'test-user-123',
      senderName: 'John Doe (Test)',
      content: 'Hey! This is a test message to demonstrate WhatsApp-style notifications 🎉',
      timestamp: new Date().toISOString(),
      isGuest: false
    };

    // Trigger the notification handler directly
    notificationService.handleChatMessageNotification(mockNotification);
    
    setLastPlayed('✅ Simulated incoming message with sound & notification');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaVolumeUp className="text-blue-500" />
            Test Chat Notifications
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Display */}
          {lastPlayed && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                {lastPlayed}
              </p>
            </div>
          )}

          {/* Audio Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Audio System Status</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                🔊 Audio Support: <span className="font-medium text-green-600">
                  {notificationService.sounds?.isAudioSupported() ? 'Enabled' : 'Not Available'}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                🎵 Audio State: <span className="font-medium text-blue-600">
                  {notificationService.sounds?.getAudioState() || 'Unknown'}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                🔔 Notifications: <span className="font-medium text-green-600">
                  {Notification.permission === 'granted' ? 'Allowed' : 
                   Notification.permission === 'denied' ? 'Blocked' : 'Not Requested'}
                </span>
              </p>
            </div>
          </div>

          {/* Sound Tests */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Test Notification Sounds</h3>
            <div className="grid grid-cols-1 gap-3">
              {soundTests.map((sound) => {
                const IconComponent = sound.icon;
                return (
                  <button
                    key={sound.type}
                    onClick={() => handleTestSound(sound.type, sound.name)}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all group"
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: sound.color }}
                    >
                      <IconComponent className="text-lg" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {sound.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {sound.description}
                      </div>
                    </div>
                    <FaPlay className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Experience Tests */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Complete Experience Tests</h3>
            <div className="space-y-3">
              
              {/* Browser Notification Test */}
              <button
                onClick={testBrowserNotification}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  🔔
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Test Browser Notification</div>
                  <div className="text-sm opacity-90">Check desktop notification permissions</div>
                </div>
              </button>

              {/* Simulate Message */}
              <button
                onClick={simulateNewMessage}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
              >
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  💬
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Simulate Incoming Message</div>
                  <div className="text-sm opacity-90">Full notification experience with sound + popup</div>
                </div>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 How to Test</h4>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
              <li>Click any sound button to test different notification tones</li>
              <li>Test browser notifications to enable desktop alerts</li>
              <li>Simulate an incoming message for the full experience</li>
              <li>Try sending real messages to hear the sounds in action</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSoundTest; 
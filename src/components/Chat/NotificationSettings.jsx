import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import notificationService from '../../services/notificationService';
import { 
  FaVolumeDown, 
  FaVolumeUp, 
  FaVolumeOff, 
  FaPlay, 
  FaBell, 
  FaBellSlash, 
  FaCog, 
  FaCheck, 
  FaTimes,
  FaDesktop,
  FaComment,
  FaExclamationTriangle,
  FaMusic
} from 'react-icons/fa';

const NotificationSettings = ({ isOpen, onClose }) => {
  const { 
    notificationPreferences, 
    saveNotificationPreferences, 
    testNotificationSound 
  } = useChat();
  
  const [localPreferences, setLocalPreferences] = useState({
    enableSounds: true,
    messageSound: 'message',
    volume: 0.3,
    enableBrowserNotifications: true,
    enableToastNotifications: true,
    enableStatusSounds: false
  });

  // Load current preferences when component opens
  useEffect(() => {
    if (isOpen) {
      setLocalPreferences(prev => ({
        ...prev,
        ...notificationPreferences
      }));
    }
  }, [isOpen, notificationPreferences]);

  // Handle preference changes
  const handlePreferenceChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save preferences
  const handleSave = () => {
    saveNotificationPreferences(localPreferences);
    onClose();
  };

  // Test notification sound
  const handleTestSound = (soundType) => {
    testNotificationSound(soundType);
  };

  // Volume level descriptions
  const getVolumeDescription = (volume) => {
    if (volume === 0) return 'Muted';
    if (volume <= 0.2) return 'Very Low';
    if (volume <= 0.4) return 'Low';
    if (volume <= 0.6) return 'Medium';
    if (volume <= 0.8) return 'High';
    return 'Very High';
  };

  // Sound type options
  const soundOptions = [
    { value: 'message', label: 'Message', icon: FaComment, description: 'Standard message tone' },
    { value: 'group', label: 'Group Chat', icon: FaComment, description: 'Triple tone for group messages' },
    { value: 'urgent', label: 'Urgent', icon: FaExclamationTriangle, description: 'Rapid beeps for urgent messages' },
    { value: 'soft', label: 'Soft', icon: FaMusic, description: 'Gentle tone for quiet environments' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBell className="text-blue-500" />
            Notification Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-4 space-y-6">
          
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FaVolumeUp className="text-green-500" />
              Sound Settings
            </h3>
            
            {/* Enable Sounds Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaVolume className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Sounds</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localPreferences.enableSounds}
                  onChange={(e) => handlePreferenceChange('enableSounds', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Volume Control */}
            {localPreferences.enableSounds && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Volume</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {getVolumeDescription(localPreferences.volume)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaVolumeOff className="text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.volume}
                    onChange={(e) => handlePreferenceChange('volume', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <FaVolumeUp className="text-gray-400" />
                </div>
              </div>
            )}

            {/* Sound Type Selection */}
            {localPreferences.enableSounds && (
              <div className="space-y-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Notification Sound</span>
                <div className="grid grid-cols-2 gap-2">
                  {soundOptions.map((option) => (
                    <div key={option.value} className="space-y-1">
                      <label 
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          localPreferences.messageSound === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="messageSound"
                          value={option.value}
                          checked={localPreferences.messageSound === option.value}
                          onChange={(e) => handlePreferenceChange('messageSound', e.target.value)}
                          className="sr-only"
                        />
                        <option.icon className={`text-sm ${
                          localPreferences.messageSound === option.value ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm ${
                          localPreferences.messageSound === option.value
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.label}
                        </span>
                      </label>
                      <button
                        onClick={() => handleTestSound(option.value)}
                        className="w-full flex items-center justify-center gap-1 py-1 px-2 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <FaPlay className="text-xs" />
                        Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaMusic className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Status Change Sounds</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localPreferences.enableStatusSounds}
                  onChange={(e) => handlePreferenceChange('enableStatusSounds', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FaBell className="text-blue-500" />
              Notification Types
            </h3>
            
            {/* Browser Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaDesktop className="text-gray-500" />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Browser Notifications</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show notifications outside the browser</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localPreferences.enableBrowserNotifications}
                  onChange={(e) => handlePreferenceChange('enableBrowserNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Toast Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaComment className="text-gray-500" />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">In-App Notifications</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show toast notifications within the app</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localPreferences.enableToastNotifications}
                  onChange={(e) => handlePreferenceChange('enableToastNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Test Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FaPlay className="text-purple-500" />
              Test Notifications
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTestSound('message')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPlay className="text-sm" />
                <span className="text-sm">Message</span>
              </button>
              <button
                onClick={() => handleTestSound('urgent')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaPlay className="text-sm" />
                <span className="text-sm">Urgent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaCheck />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 
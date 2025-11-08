import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useActivityTracker from '../../hooks/useActivityTracker';

const ActivityTimer = () => {
  const { user } = useAuth();
  const [sessionTime, setSessionTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  
  // Get activity tracker functions and state
  const { 
    isSessionActive, 
    sessionStartTime, 
    isManuallyPaused, 
    startSession, 
    pauseSession 
  } = useActivityTracker();

  useEffect(() => {
    if (!user || user.role === 'Customer') return;

    // Update timer every second
    const interval = setInterval(() => {
      if (sessionStartTime && !isManuallyPaused) {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - sessionStartTime) / 1000);
        setSessionTime(elapsed);
      } else {
        setSessionTime(0);
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [user, sessionStartTime, isManuallyPaused]);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Handle start/pause button click
  const handleToggle = () => {
    if (isManuallyPaused) {
      startSession();
    } else {
      pauseSession();
    }
  };

  // Don't show for customers or if user is not logged in
  if (!user || user.role === 'Customer') {
    return null;
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main Timer Display */}
      <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg cursor-pointer">
        <div className={`w-2 h-2 rounded-full ${
          !isManuallyPaused && sessionStartTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}></div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-500">
          <span className="hidden sm:inline">Session: </span>
          <span className="font-mono">{formatTime(sessionTime)}</span>
        </div>
        
        {/* Status indicator */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {isManuallyPaused ? '⏸️' : sessionStartTime ? '▶️' : '⏹️'}
        </div>
      </div>

      {/* Control Panel (shows on hover) */}
      {showControls && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-black/25 p-3 z-50 min-w-[200px]">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-500 mb-2">
            Activity Timer Controls
          </div>
          
          {/* Current Status */}
          <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
            Status: {
              isManuallyPaused ? 'Manually Paused' : 
              sessionStartTime ? 'Active' : 'Stopped'
            }
          </div>
          
          {/* Control Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleToggle}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                isManuallyPaused
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isManuallyPaused ? '▶️ Start' : '⏸️ Pause'}
            </button>
          </div>
          
          {/* Help Text */}
          <div className="text-xs text-gray-400 dark:text-gray-400 mt-2 leading-relaxed">
            Timer automatically pauses when system locks or tab is hidden.
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimer; 
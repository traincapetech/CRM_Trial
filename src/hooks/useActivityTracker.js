import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// API configuration - always use production URL
const API_BASE_URL = 'https://crm-backend-o36v.onrender.com/api';

const useActivityTracker = () => {
  const { user, token } = useAuth();
  const sessionStartTime = useRef(null);
  const lastActivityTime = useRef(Date.now());
  const activityInterval = useRef(null);
  const inactivityTimeout = useRef(null);
  const isSessionActive = useRef(false);
  const hasStartedSession = useRef(false);
  const isManuallyPaused = useRef(false);
  const visibilityChangeListener = useRef(null);

  // Configuration
  const ACTIVITY_CHECK_INTERVAL = 30000; // Check every 30 seconds
  const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes of inactivity
  const TRACK_INTERVAL = 60000; // Send tracking data every minute

  // API helper with auth headers
  const apiCall = useCallback(async (endpoint, method = 'GET', data = null) => {
    if (!token) return null;

    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Activity API error:', error);
      return null;
    }
  }, [token]);

  // Start activity session
  const startSession = useCallback(async () => {
    if (!user || !token || hasStartedSession.current || isManuallyPaused.current) return;

    try {
      const result = await apiCall('/activity/start-session', 'POST');
      if (result?.success) {
        sessionStartTime.current = Date.now();
        lastActivityTime.current = Date.now();
        isSessionActive.current = true;
        hasStartedSession.current = true;
        
        // Store session start time in localStorage
        localStorage.setItem('activitySessionStart', sessionStartTime.current.toString());
        localStorage.setItem('activitySessionActive', 'true');
        
        console.log('Activity session started');
      }
    } catch (error) {
      console.error('Failed to start activity session:', error);
    }
  }, [user, token, apiCall]);

  // End activity session
  const endSession = useCallback(async (duration = null) => {
    if (!hasStartedSession.current || !sessionStartTime.current) return;

    try {
      const sessionDuration = duration || Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      // For page unload, use sendBeacon with special endpoint
      if (navigator.sendBeacon && token) {
        const data = JSON.stringify({ 
          duration: sessionDuration,
          token // Include token in body for beacon endpoint
        });
        const url = `${API_BASE_URL}/activity/end-session-beacon`;
        
        const blob = new Blob([data], { type: 'application/json' });
        const sent = navigator.sendBeacon(url, blob);
        
        if (sent) {
          console.log('Activity session ended via beacon');
        } else {
          // Fallback to regular API call
          await apiCall('/activity/end-session', 'POST', { duration: sessionDuration });
        }
      } else {
        // Fallback for browsers without sendBeacon
        await apiCall('/activity/end-session', 'POST', { duration: sessionDuration });
      }

      // Reset session state
      sessionStartTime.current = null;
      isSessionActive.current = false;
      hasStartedSession.current = false;
      
      // Clear localStorage
      localStorage.removeItem('activitySessionStart');
      localStorage.removeItem('activitySessionActive');
      
      console.log('Activity session ended');
    } catch (error) {
      console.error('Failed to end activity session:', error);
    }
  }, [apiCall, token]);

  // Manual start function for employees
  const manualStart = useCallback(async () => {
    isManuallyPaused.current = false;
    localStorage.setItem('activityManuallyPaused', 'false');
    await startSession();
  }, [startSession]);

  // Manual pause function for employees
  const manualPause = useCallback(async () => {
    isManuallyPaused.current = true;
    localStorage.setItem('activityManuallyPaused', 'true');
    await endSession();
  }, [endSession]);

  // Track activity (periodic updates)
  const trackActivity = useCallback(async () => {
    if (!hasStartedSession.current || !sessionStartTime.current || isManuallyPaused.current) return;

    try {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTime.current;
      const isCurrentlyActive = timeSinceLastActivity < INACTIVITY_THRESHOLD;

      if (isCurrentlyActive) {
        const sessionDuration = Math.floor((currentTime - sessionStartTime.current) / 1000);
        await apiCall('/activity/track', 'POST', { 
          duration: sessionDuration, 
          isActive: true 
        });
      }
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }, [apiCall, INACTIVITY_THRESHOLD]);

  // Update last activity time
  const updateActivity = useCallback(() => {
    if (isManuallyPaused.current) return;
    
    lastActivityTime.current = Date.now();
    
    // Clear existing inactivity timeout
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }

    // Set new inactivity timeout
    inactivityTimeout.current = setTimeout(() => {
      if (isSessionActive.current && !isManuallyPaused.current) {
        console.log('User inactive, pausing session tracking');
        isSessionActive.current = false;
      }
    }, INACTIVITY_THRESHOLD);
  }, [INACTIVITY_THRESHOLD]);

  // Handle page visibility change (tab switching, system lock, etc.)
  const handleVisibilityChange = useCallback(async () => {
    if (document.hidden || document.visibilityState === 'hidden') {
      // Page is hidden - could be tab switch or system lock
      console.log('Page hidden - continuing activity tracking (tab switch or system lock)');
      // Store the time when page became hidden
      localStorage.setItem('activityPageHiddenTime', Date.now().toString());
      
      // DON'T pause the session - let it continue running
      // The timer should keep running even when tab is switched
    } else if (document.visibilityState === 'visible') {
      // Page is visible again
      const hiddenTime = localStorage.getItem('activityPageHiddenTime');
      if (hiddenTime) {
        const timeHidden = Date.now() - parseInt(hiddenTime);
        console.log(`Page visible again after ${Math.floor(timeHidden / 1000)} seconds`);
        
        // If hidden for more than 10 minutes (600000ms), likely system was locked
        if (timeHidden > 600000) {
          console.log('System was likely locked - restarting session');
          if (user && token && !isManuallyPaused.current) {
            // End previous session and start new one
            if (hasStartedSession.current) {
              await endSession();
            }
            setTimeout(() => startSession(), 1000);
          }
        } else {
          console.log('Tab switch detected - continuing existing session');
          // Just a tab switch - continue existing session
          if (user && token && !hasStartedSession.current && !isManuallyPaused.current) {
            startSession();
          }
        }
        
        localStorage.removeItem('activityPageHiddenTime');
      }
    }
  }, [user, token, startSession, endSession]);

  // Handle page unload
  const handleBeforeUnload = useCallback(() => {
    if (hasStartedSession.current && sessionStartTime.current) {
      const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      // Use sendBeacon for reliable tracking
      if (navigator.sendBeacon && token) {
        const data = JSON.stringify({ 
          duration,
          token // Include token in body for beacon endpoint
        });
        const url = `${API_BASE_URL}/activity/end-session-beacon`;
        
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    }
  }, [token]);

  // Set up activity tracking
  useEffect(() => {
    if (!user || !token) return;

    // Check if manually paused from localStorage
    const manuallyPaused = localStorage.getItem('activityManuallyPaused') === 'true';
    isManuallyPaused.current = manuallyPaused;

    // Check for existing session from localStorage
    const existingSessionStart = localStorage.getItem('activitySessionStart');
    const existingSessionActive = localStorage.getItem('activitySessionActive') === 'true';
    
    if (existingSessionStart && existingSessionActive && !manuallyPaused) {
      // Resume existing session
      console.log('Resuming existing activity session');
      sessionStartTime.current = parseInt(existingSessionStart);
      isSessionActive.current = true;
      hasStartedSession.current = true;
      lastActivityTime.current = Date.now();
    } else if (!manuallyPaused) {
      // Start new session
      startSession();
    }

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Set up periodic tracking
    activityInterval.current = setInterval(trackActivity, TRACK_INTERVAL);

    // Set up visibility change listener (handles system lock/unlock)
    visibilityChangeListener.current = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Clear intervals and timeouts
      if (activityInterval.current) {
        clearInterval(activityInterval.current);
      }
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }

      // Don't end session on component unmount - let it persist
      // Session will be ended manually or on actual logout
    };
  }, [user, token, startSession, endSession, updateActivity, trackActivity, handleVisibilityChange, handleBeforeUnload, TRACK_INTERVAL]);

  // Return session info and controls
  return {
    isSessionActive: isSessionActive.current,
    sessionStartTime: sessionStartTime.current,
    isManuallyPaused: isManuallyPaused.current,
    startSession: manualStart,
    pauseSession: manualPause,
    updateActivity
  };
};

export default useActivityTracker; 
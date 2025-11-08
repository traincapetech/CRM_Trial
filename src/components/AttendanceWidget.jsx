import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';

const AttendanceWidget = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Office location coordinates
  const OFFICE_LOCATION = {
    latitude: 28.607407 ,   // UPDATE: Replace with your actual office latitude
    longitude: 77.081754,  // UPDATE: Replace with your actual office longitude
    allowedRadius: 40    // 40 meters radius
  };

  // Add auto-refresh effect
  useEffect(() => {
    // Initial fetch
    fetchTodayAttendance();

    // Set up interval to refresh data every minute
    const interval = setInterval(fetchTodayAttendance, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      if (response.data.success) {
        // Format the attendance data to match the expected structure
        const attendanceData = response.data.data ? {
          data: {
            checkIn: response.data.data.checkIn ? new Date(response.data.data.checkIn) : null,
            checkOut: response.data.data.checkOut ? new Date(response.data.data.checkOut) : null,
            status: response.data.data.status || 'PENDING',
            notes: response.data.data.notes || ''
          },
          hasCheckedIn: response.data.hasCheckedIn,
          hasCheckedOut: response.data.hasCheckedOut
        } : null;
        
        setTodayAttendance(attendanceData);
        
        // If we have attendance data, also get the location to show status
        if (attendanceData?.data?.checkIn && !attendanceData?.data?.checkOut) {
          try {
            await getCurrentLocation();
          } catch (error) {
            // Ignore location errors during auto-refresh
            console.warn('Could not get location during refresh:', error);
          }
        }
      } else {
        toast.error('Failed to fetch attendance status');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      toast.error('Failed to fetch attendance status');
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      setGettingLocation(true);
      setLocationError('');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Check if user is within office range
          const distance = calculateDistance(
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude,
            userLocation.latitude,
            userLocation.longitude
          );
          
          const isInRange = distance <= OFFICE_LOCATION.allowedRadius;
          
          setLocation({ ...userLocation, distance, isInRange });
          setGettingLocation(false);
          
          if (!isInRange) {
            setLocationError(`You are ${distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters to mark attendance.`);
            reject(new Error('Not in office range'));
          } else {
            resolve(userLocation);
          }
        },
        (error) => {
          setGettingLocation(false);
          let errorMessage = 'Unable to get your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
          
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      
      // Get location first
      const locationData = await getCurrentLocation();
      
      const response = await attendanceAPI.checkIn({ 
        notes,
        location: locationData
      });
      
      if (response.data.success) {
        // Format the attendance data
        const attendanceData = {
          data: {
            checkIn: new Date(response.data.data.checkIn),
            checkOut: null,
            status: response.data.data.status || 'PRESENT',
            notes: response.data.data.notes || ''
          },
          hasCheckedIn: true,
          hasCheckedOut: false
        };
        
        setTodayAttendance(attendanceData);
        setNotes('');
        toast.success('Check-in successful!');
      } else {
        toast.error(response.data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      if (error.message === 'Not in office range') {
        toast.error('You must be within office premises to check in');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check in');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      
      // Get location first
      const locationData = await getCurrentLocation();
      
      const response = await attendanceAPI.checkOut({ 
        notes,
        location: locationData
      });
      
      if (response.data.success) {
        // Format the attendance data
        const attendanceData = {
          data: {
            checkIn: new Date(response.data.data.checkIn),
            checkOut: new Date(response.data.data.checkOut),
            status: response.data.data.status || 'PRESENT',
            notes: response.data.data.notes || ''
          },
          hasCheckedIn: true,
          hasCheckedOut: true
        };
        
        setTodayAttendance(attendanceData);
        setNotes('');
        toast.success('Check-out successful!');
      } else {
        toast.error(response.data.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      if (error.message === 'Not in office range') {
        toast.error('You must be within office premises to check out');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check out');
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Attendance
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {todayAttendance?.data ? (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-800 dark:text-green-300 text-sm font-medium">
                Check-in Time
              </div>
              <div className="text-green-900 dark:text-green-100 text-lg font-bold">
                {formatTime(todayAttendance.data.checkIn)}
              </div>
            </div>
            
            {todayAttendance.data.checkOut ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-red-800 dark:text-red-300 text-sm font-medium">
                  Check-out Time
                </div>
                <div className="text-red-900 dark:text-red-100 text-lg font-bold">
                  {formatTime(todayAttendance.data.checkOut)}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Check-out Time
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  Not checked out
                </div>
              </div>
            )}
          </div>

          {/* Location Status */}
          {location && (
            <div className={`mt-4 p-3 rounded-lg ${
              location.isInRange 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`flex items-center text-sm ${
                location.isInRange 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <FaMapMarkerAlt className="mr-2" />
                <div>
                  <div className="font-medium">
                    {location.isInRange ? '✅ Within Office Range' : '❌ Outside Office Range'}
                  </div>
                  <div className="text-xs mt-1">
                    Distance: {location.distance ? `${location.distance.toFixed(1)}m` : 'Calculating...'} 
                    (Required: ≤ {OFFICE_LOCATION.allowedRadius}m)
                  </div>
                </div>
              </div>
            </div>
          )}

          {!todayAttendance.data.checkOut && (
            <div className="mt-4 space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for check-out (optional)"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                rows="2"
              />
              <button
                onClick={handleCheckOut}
                disabled={checkingOut || gettingLocation}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                {gettingLocation ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Getting Location...
                  </>
                ) : checkingOut ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Checking Out...
                  </>
                ) : (
                  'Check Out'
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-gray-500 dark:text-gray-400">
            You haven't checked in today
          </div>
          
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for check-in (optional)"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              rows="2"
            />
            <button
              onClick={handleCheckIn}
              disabled={checkingIn || gettingLocation}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              {gettingLocation ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Getting Location...
                </>
              ) : checkingIn ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Checking In...
                </>
              ) : (
                'Check In'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-sm text-red-600 dark:text-red-400">
            {locationError}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceWidget; 
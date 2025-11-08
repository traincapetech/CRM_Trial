import React, { useState, useEffect } from 'react';
import { FaClock, FaCalendarCheck, FaSignInAlt, FaSignOutAlt, FaChartBar, FaMapMarkerAlt, FaDownload, FaFilter, FaSpinner, FaUsers, FaEdit, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { attendanceAPI } from '../../services/api';
import employeeAPI from '../../services/employeeAPI';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

// Office location coordinates (update these with your actual office coordinates)
const OFFICE_LOCATION = {
  latitude: 28.607407 ,   // UPDATE: Replace with your actual office latitude
  longitude: 77.081754,  // UPDATE: Replace with your actual office longitude
  allowedRadius: 20    // 20 meters radius (you can adjust this)
};

const AttendanceManagement = ({ employeeId, userRole }) => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isInOfficeRange, setIsInOfficeRange] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReports, setShowReports] = useState(false);
  
  // Admin-specific state
  const [allEmployeesAttendance, setAllEmployeesAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({});
  
  // Check if user is admin/manager/hr
  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR';

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

  // Check if user is within office range
  const checkLocationValidity = (userLat, userLng) => {
    const distance = calculateDistance(
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude,
      userLat,
      userLng
    );
    return distance <= OFFICE_LOCATION.allowedRadius;
  };

  // Admin-specific functions
  const fetchAllEmployeesAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAllAttendance({
        date: selectedDate,
        employeeId: selectedEmployee,
        page: 1,
        limit: 100
      });
      
      if (response.data.success) {
        setAllEmployeesAttendance(response.data.data);
        calculateAttendanceStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching all employees attendance:', error);
      toast.error('Failed to fetch employees attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const calculateAttendanceStats = (attendanceData) => {
    const stats = {
      totalEmployees: employees.length,
      presentToday: attendanceData.filter(a => a.status === 'PRESENT').length,
      absentToday: employees.length - attendanceData.length,
      halfDayToday: attendanceData.filter(a => a.status === 'HALF_DAY').length,
      lateToday: attendanceData.filter(a => a.status === 'LATE').length,
      earlyLeaveToday: attendanceData.filter(a => a.status === 'EARLY_LEAVE').length
    };
    setAttendanceStats(stats);
  };

  const handleUpdateAttendance = async (attendanceId, updates) => {
    try {
      const response = await attendanceAPI.updateAttendance(attendanceId, updates);
      if (response.data.success) {
        toast.success('Attendance updated successfully');
        fetchAllEmployeesAttendance();
        setEditingAttendance(null);
      } else {
        toast.error(response.data.message || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const markAttendanceForEmployee = async (employeeId, status, notes = '') => {
    try {
      // Validate required fields
      if (!employeeId || !selectedDate) {
        toast.error('Please select an employee and date');
        return;
      }

      const attendanceData = {
        employeeId,
        date: selectedDate,
        status,
        notes
      };
      
      console.log('Frontend: Sending attendance data:', attendanceData);
      const response = await attendanceAPI.createAttendance(attendanceData);
      if (response.data.success) {
        toast.success(`Attendance marked as ${status} for employee`);
        fetchAllEmployeesAttendance();
        setSelectedEmployee(''); // Reset selection
      } else {
        toast.error(response.data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      // Admin view - fetch all employees attendance
      fetchEmployees();
      fetchAllEmployeesAttendance();
    } else {
      // Employee view - fetch personal attendance
      fetchAttendance();
      fetchTodayAttendance();
    }
  }, [isAdmin, selectedDate, selectedEmployee]);

  useEffect(() => {
    if (!isAdmin) {
      // Set up interval to refresh data every minute for employees
      const interval = setInterval(() => {
        fetchAttendance();
        fetchTodayAttendance();
      }, 60000); // 60000 ms = 1 minute

      return () => clearInterval(interval);
    }
  }, [selectedMonth, selectedYear, isAdmin]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        month: selectedMonth + 1, // API expects 1-based month
        year: selectedYear
      };
      const response = await attendanceAPI.getHistory(params);
      setAttendance(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      if (response.data.success) {
        setTodayAttendance(response.data.data);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      toast.error('Failed to fetch today\'s attendance status');
    }
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
          setGettingLocation(false);
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Check if user is within office range
          const isInRange = checkLocationValidity(userLocation.latitude, userLocation.longitude);
          const distance = calculateDistance(
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude,
            userLocation.latitude,
            userLocation.longitude
          );
          
          userLocation.distance = distance;
          userLocation.isInOfficeRange = isInRange;
          
          setLocation(userLocation);
          setIsInOfficeRange(isInRange);
          
          if (!isInRange) {
            setLocationError(`You are ${distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters to mark attendance.`);
          } else {
            setLocationError('');
          }
          
          resolve(userLocation);
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
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      // Get location for check-in
      let locationData = null;
      try {
        locationData = await getCurrentLocation();
        
        // Check if user is within office range
        if (!locationData.isInOfficeRange) {
          toast.error(`Cannot check in: You are ${locationData.distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters of the office location.`);
          return;
        }
      } catch (error) {
        console.warn('Could not get location:', error);
        toast.error('Location access is required for attendance marking. Please enable location services and try again.');
        return;
      }
      
      const response = await attendanceAPI.checkIn({ 
        notes: '', 
        location: locationData 
      });
      
      if (response.data.success) {
        setTodayAttendance(response.data.data);
        toast.success('Check-in successful! You are within the office premises.');
        
        // Refresh attendance data
        fetchAttendance();
      } else {
        toast.error(response.data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      // Get location for check-out
      let locationData = null;
      try {
        locationData = await getCurrentLocation();
        
        // Check if user is within office range
        if (!locationData.isInOfficeRange) {
          toast.error(`Cannot check out: You are ${locationData.distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters of the office location.`);
          return;
        }
      } catch (error) {
        console.warn('Could not get location:', error);
        toast.error('Location access is required for attendance marking. Please enable location services and try again.');
        return;
      }
      
      const response = await attendanceAPI.checkOut({ 
        notes: '', 
        location: locationData 
      });
      
      if (response.data.success) {
        setTodayAttendance(response.data.data);
        toast.success('Check-out successful! Have a great day.');
        
        // Refresh attendance data
        fetchAttendance();
      } else {
        toast.error(response.data.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out. Please try again.');
    }
  };

  const calculateStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(att => att.status === 'PRESENT').length;
    const totalHours = attendance.reduce((sum, att) => sum + (att.totalHours || 0), 0);
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    return {
      totalDays,
      presentDays,
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1),
      attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
    };
  };

  const exportAttendanceData = () => {
    const filteredData = getFilteredAttendance();
    const csvContent = [
      ['Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Location'],
      ...filteredData.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--',
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--',
        record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--',
        record.status,
        record.location ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${months[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredAttendance = () => {
    return attendance.filter(record => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'Present') return record.status === 'PRESENT';
      if (filterStatus === 'Absent') return record.status === 'ABSENT';
      if (filterStatus === 'Half Day') return record.status === 'HALF_DAY';
      if (filterStatus === 'Late') return record.status === 'LATE';
      return record.status === filterStatus;
    });
  };

  const stats = calculateStats();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Admin view
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaUsers className="mr-2 text-blue-600" />
              Employee Attendance Management
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {attendanceStats.presentToday || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <FaTimes className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent Today</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {attendanceStats.absentToday || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FaClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Half Day</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {attendanceStats.halfDayToday || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {attendanceStats.totalEmployees || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Attendance List */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee Attendance - {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <button
              onClick={() => setShowEmployeeSelector(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Mark Attendance
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check In</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check Out</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hours</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {allEmployeesAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No attendance records found for selected date
                      </td>
                    </tr>
                  ) : (
                    allEmployeesAttendance.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {record.employeeId?.fullName || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            record.status === 'HALF_DAY' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            record.status === 'LATE' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          <button
                            onClick={() => setEditingAttendance(record)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Employee Selector Modal */}
        {showEmployeeSelector && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Mark Attendance for Employee
                </h3>
                <div className="space-y-4">
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAttendanceForEmployee(selectedEmployee, 'PRESENT')}
                      disabled={!selectedEmployee}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendanceForEmployee(selectedEmployee, 'HALF_DAY')}
                      disabled={!selectedEmployee}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Half Day
                    </button>
                    <button
                      onClick={() => markAttendanceForEmployee(selectedEmployee, 'ABSENT')}
                      disabled={!selectedEmployee}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Absent
                    </button>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowEmployeeSelector(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Employee view
  return (
    <div className="space-y-6">
      {/* Today's Attendance */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <FaClock className="mr-2 text-blue-600" />
          Today's Attendance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentTime.toTimeString().slice(0, 8)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Check In</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Check Out</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          {!todayAttendance?.checkIn ? (
            <button
              onClick={handleCheckIn}
              disabled={gettingLocation}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {gettingLocation ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSignInAlt className="mr-2" />
              )}
              {gettingLocation ? 'Getting Location...' : 'Check In'}
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              onClick={handleCheckOut}
              disabled={gettingLocation}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              {gettingLocation ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSignOutAlt className="mr-2" />
              )}
              {gettingLocation ? 'Getting Location...' : 'Check Out'}
            </button>
          ) : (
            <div className="text-center">
              <div className="text-green-600 font-medium">
                ✅ Attendance marked for today
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Working Hours: {todayAttendance.totalHours?.toFixed(1)} hours
              </div>
              {todayAttendance?.location && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center">
                  <FaMapMarkerAlt className="mr-1" />
                  Location tracked
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Status */}
        {location && (
          <div className={`mt-4 p-3 rounded-lg ${
            isInOfficeRange 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className={`flex items-center text-sm ${
              isInOfficeRange 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              <FaMapMarkerAlt className="mr-2" />
              <div>
                <div className="font-medium">
                  {isInOfficeRange ? '✅ Within Office Range' : '❌ Outside Office Range'}
                </div>
                <div className="text-xs mt-1">
                  Your Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                <div className="text-xs">
                  Office Location: {OFFICE_LOCATION.latitude.toFixed(6)}, {OFFICE_LOCATION.longitude.toFixed(6)}
                </div>
                <div className="text-xs">
                  Distance: {location.distance ? `${location.distance.toFixed(1)}m` : 'Calculating...'} 
                  (Required: ≤ {OFFICE_LOCATION.allowedRadius}m)
                </div>
                <div className="text-xs">
                  GPS Accuracy: ±{location.accuracy.toFixed(0)}m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center text-sm text-red-600 dark:text-red-400">
              <FaMapMarkerAlt className="mr-2" />
              <div>
                <div className="font-medium">Location Error</div>
                <div className="text-xs mt-1">{locationError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Office Location Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <FaMapMarkerAlt className="mr-2" />
            <div>
              <div className="font-medium">Office Location</div>
              <div className="text-xs mt-1">
                {OFFICE_LOCATION.latitude.toFixed(6)}, {OFFICE_LOCATION.longitude.toFixed(6)}
              </div>
              <div className="text-xs">
                Attendance allowed within {OFFICE_LOCATION.allowedRadius} meters radius
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <FaChartBar className="mr-2 text-blue-600" />
          Monthly Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avgHours}h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.attendanceRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Attendance</div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FaCalendarCheck className="mr-2 text-blue-600" />
            Attendance History
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => exportAttendanceData()}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <FaDownload className="mr-1" />
              Export
            </button>
            <button
              onClick={() => setShowReports(!showReports)}
              className="flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              <FaChartBar className="mr-1" />
              Reports
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner 
              size={45}
              text="Loading attendance..."
              particleCount={1}
              speed={1.2}
              hueRange={[180, 240]}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check In</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check Out</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hours</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredAttendance().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No attendance records found for selected filters
                    </td>
                  </tr>
                ) : (
                  getFilteredAttendance().map((record) => (
                    <tr key={`${record.date}-${record._id || Date.now()}`} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Present' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : record.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : record.status === 'Half Day'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.location ? (
                          <FaMapMarkerAlt className="text-green-600" title="Location tracked" />
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Reports Section */}
        {showReports && (
          <div className="mt-6 bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Analytics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Weekly Pattern</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Monday: {attendance.filter(a => new Date(a.date).getDay() === 1).length} days</p>
                  <p>Tuesday: {attendance.filter(a => new Date(a.date).getDay() === 2).length} days</p>
                  <p>Wednesday: {attendance.filter(a => new Date(a.date).getDay() === 3).length} days</p>
                  <p>Thursday: {attendance.filter(a => new Date(a.date).getDay() === 4).length} days</p>
                  <p>Friday: {attendance.filter(a => new Date(a.date).getDay() === 5).length} days</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Time Patterns</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Early Check-ins: {attendance.filter(a => a.checkIn && a.checkIn < '09:00').length}</p>
                  <p>Late Check-ins: {attendance.filter(a => a.checkIn && a.checkIn > '09:15').length}</p>
                  <p>Early Check-outs: {attendance.filter(a => a.checkOut && a.checkOut < '17:30').length}</p>
                  <p>Late Check-outs: {attendance.filter(a => a.checkOut && a.checkOut > '18:30').length}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Perfect Days: {attendance.filter(a => a.workingHours >= 8).length}</p>
                  <p>Short Days: {attendance.filter(a => a.workingHours < 8 && a.workingHours > 0).length}</p>
                  <p>Location Tracked: {attendance.filter(a => a.location).length} days</p>
                  <p>Punctuality Score: {attendance.length > 0 ? ((attendance.filter(a => a.checkIn && a.checkIn <= '09:00').length / attendance.length) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement; 
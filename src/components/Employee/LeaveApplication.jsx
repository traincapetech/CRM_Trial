import React, { useState, useEffect } from 'react';
import { FaCalendarPlus, FaCalendarCheck, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import leaveAPI from '../../services/leaveAPI';

const LeaveApplication = () => {
  const [leaveData, setLeaveData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDaySession: 'morning'
  });
  
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('apply');

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave', icon: '🏖️' },
    { value: 'sick', label: 'Sick Leave', icon: '🤒' },
    { value: 'annual', label: 'Annual Leave', icon: '✈️' },
    { value: 'emergency', label: 'Emergency Leave', icon: '🚨' },
    { value: 'personal', label: 'Personal Leave', icon: '👤' },
    { value: 'maternity', label: 'Maternity Leave', icon: '🤱' },
    { value: 'paternity', label: 'Paternity Leave', icon: '👨‍👶' },
    { value: 'bereavement', label: 'Bereavement Leave', icon: '🙏' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    pending: <FaClock className="w-4 h-4" />,
    approved: <FaCheckCircle className="w-4 h-4" />,
    rejected: <FaTimes className="w-4 h-4" />,
    cancelled: <FaTimes className="w-4 h-4" />
  };

  useEffect(() => {
    fetchMyLeaves();
    fetchLeaveBalance();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyLeaves();
      setMyLeaves(response.data.data || []);
    } catch (error) {
      setError('Failed to fetch leave history');
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await leaveAPI.getLeaveBalance();
      setLeaveBalance(response.data.data || {});
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLeaveData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!leaveData.leaveType || !leaveData.startDate || !leaveData.endDate || !leaveData.reason.trim()) {
      setError('Please fill in all required fields');
      return false;
    }

    if (leaveData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long');
      return false;
    }

    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (startDate > endDate) {
      setError('End date must be after start date');
      return false;
    }

    if (leaveData.isHalfDay && !leaveData.halfDaySession) {
      setError('Please select half day session');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError('');
      
      await leaveAPI.applyLeave(leaveData);
      
      setSuccess('Leave application submitted successfully!');
      setLeaveData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false,
        halfDaySession: 'morning'
      });
      
      // Refresh data
      fetchMyLeaves();
      fetchLeaveBalance();
      
      // Switch to history tab to see the new application
      setTimeout(() => {
        setActiveTab('history');
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      await leaveAPI.cancelLeave(leaveId);
      setSuccess('Leave cancelled successfully');
      fetchMyLeaves();
      fetchLeaveBalance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel leave');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = () => {
    if (!leaveData.startDate || !leaveData.endDate) return 0;
    
    if (leaveData.isHalfDay) return 0.5;
    
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('apply')}
              className={`${
                activeTab === 'apply'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaCalendarPlus className="mr-2" />
              Apply Leave
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaCalendarCheck className="mr-2" />
              Leave History
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`${
                activeTab === 'balance'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaClock className="mr-2" />
              Leave Balance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center">
              <FaCheckCircle className="mr-2" />
              {success}
            </div>
          )}

          {/* Apply Leave Tab */}
          {activeTab === 'apply' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Apply for Leave</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Leave Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Leave Type *
                    </label>
                    <select
                      name="leaveType"
                      value={leaveData.leaveType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {leaveTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Half Day Option */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isHalfDay"
                        checked={leaveData.isHalfDay}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Half Day</span>
                    </label>
                    
                    {leaveData.isHalfDay && (
                      <select
                        name="halfDaySession"
                        value={leaveData.halfDaySession}
                        onChange={handleInputChange}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={leaveData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={leaveData.endDate}
                      onChange={handleInputChange}
                      min={leaveData.startDate || new Date().toISOString().split('T')[0]}
                      disabled={leaveData.isHalfDay}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required={!leaveData.isHalfDay}
                    />
                    {leaveData.isHalfDay && (
                      <input type="hidden" name="endDate" value={leaveData.startDate} />
                    )}
                  </div>
                </div>

                {/* Total Days Display */}
                {(leaveData.startDate && (leaveData.endDate || leaveData.isHalfDay)) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Total Days:</span> {calculateDays()} day(s)
                    </p>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Leave *
                  </label>
                  <textarea
                    name="reason"
                    value={leaveData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Please provide a detailed reason for your leave (minimum 10 characters)"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {leaveData.reason.length}/500 characters (minimum 10)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition duration-200 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCalendarPlus className="mr-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leave History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Leave History</h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : myLeaves.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaCalendarCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No leave applications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myLeaves.map((leave) => (
                    <div key={leave._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {leaveTypes.find(t => t.value === leave.leaveType)?.icon} {' '}
                              {leaveTypes.find(t => t.value === leave.leaveType)?.label}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[leave.status]}`}>
                              {statusIcons[leave.status]}
                              <span className="ml-1 capitalize">{leave.status}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-medium">Duration:</span> {formatDate(leave.startDate)} 
                              {leave.startDate !== leave.endDate && ` - ${formatDate(leave.endDate)}`}
                              {leave.isHalfDay && ` (${leave.halfDaySession} half)`}
                            </div>
                            <div>
                              <span className="font-medium">Days:</span> {leave.totalDays}
                            </div>
                            <div>
                              <span className="font-medium">Applied:</span> {formatDate(leave.appliedDate)}
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Reason:</span>
                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{leave.reason}</p>
                          </div>
                          
                          {leave.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                              <span className="font-medium text-sm text-red-800 dark:text-red-200">Rejection Reason:</span>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{leave.rejectionReason}</p>
                            </div>
                          )}
                          
                          {leave.approvedBy && leave.status === 'approved' && (
                            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                              <span className="font-medium">Approved by:</span> {leave.approvedBy.fullName} on {formatDate(leave.approvedDate)}
                            </div>
                          )}
                        </div>
                        
                        {leave.status === 'pending' && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leave Balance Tab */}
          {activeTab === 'balance' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Leave Balance ({new Date().getFullYear()})</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(leaveBalance).map(([type, balance]) => {
                  const leaveTypeInfo = leaveTypes.find(t => t.value === type);
                  return (
                    <div key={type} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <span className="mr-2">{leaveTypeInfo?.icon}</span>
                          {leaveTypeInfo?.label}
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{balance.total} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Used:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">{balance.used} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{balance.remaining} days</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(balance.used / balance.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication; 
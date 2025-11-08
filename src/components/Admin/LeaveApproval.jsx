import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaFilter, FaSearch, FaClock, FaCalendarCheck, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import leaveAPI from '../../services/leaveAPI';

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [processing, setProcessing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

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
    fetchLeaves();
  }, [filters, pagination.page]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await leaveAPI.getAllLeaves(params);
      setLeaves(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      setError('Failed to fetch leave applications');
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApprovalAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  const confirmApprovalAction = async () => {
    if (actionType === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      
      if (actionType === 'approve') {
        await leaveAPI.approveLeave(selectedLeave._id);
      } else {
        await leaveAPI.rejectLeave(selectedLeave._id, rejectionReason);
      }
      
      setSuccess(`Leave ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      fetchLeaves();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${actionType} leave`);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeaveTypeInfo = (type) => {
    return leaveTypes.find(t => t.value === type) || { label: type, icon: '📄' };
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaCalendarCheck className="mr-3 text-blue-600" />
              Leave Approval
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {pagination.total} applications
            </div>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
              <button onClick={() => setError('')} className="ml-auto">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center">
              <FaCheckCircle className="mr-2" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leave Type
              </label>
              <select
                name="leaveType"
                value={filters.leaveType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Types</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Employee name..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition duration-200 flex items-center justify-center"
              >
                <FaFilter className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Leave Applications List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaCalendarCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No leave applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => {
                const leaveTypeInfo = getLeaveTypeInfo(leave.leaveType);
                return (
                  <div key={leave._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{leaveTypeInfo.icon}</span>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {leaveTypeInfo.label}
                            </h4>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[leave.status]}`}>
                            {statusIcons[leave.status]}
                            <span className="ml-1 capitalize">{leave.status}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div>
                            <span className="font-medium">Employee:</span>
                            <div className="text-gray-900 dark:text-gray-100">
                              {leave.employeeId?.fullName || leave.userId?.fullName}
                            </div>
                            <div className="text-xs">
                              {leave.employeeId?.email || leave.userId?.email}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <div className="text-gray-900 dark:text-gray-100">
                              {formatDate(leave.startDate)}
                              {leave.startDate !== leave.endDate && ` - ${formatDate(leave.endDate)}`}
                              {leave.isHalfDay && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded ml-1">
                                  {leave.halfDaySession} half
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Days:</span>
                            <span className="text-gray-900 dark:text-gray-100 ml-1">{leave.totalDays}</span>
                          </div>
                          <div>
                            <span className="font-medium">Applied:</span>
                            <div className="text-gray-900 dark:text-gray-100">{formatDate(leave.appliedDate)}</div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Reason:</span>
                          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{leave.reason}</p>
                        </div>
                        
                        {leave.rejectionReason && (
                          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                            <span className="font-medium text-sm text-red-800 dark:text-red-200">Rejection Reason:</span>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{leave.rejectionReason}</p>
                          </div>
                        )}
                        
                        {leave.approvedBy && leave.status === 'approved' && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            <span className="font-medium">Approved by:</span> {leave.approvedBy.fullName} on {formatDate(leave.approvedDate)}
                          </div>
                        )}
                      </div>
                      
                      {leave.status === 'pending' && (
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => handleApprovalAction(leave, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200 flex items-center"
                          >
                            <FaCheck className="mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovalAction(leave, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200 flex items-center"
                          >
                            <FaTimes className="mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Employee: <span className="font-medium text-gray-900 dark:text-white">
                    {selectedLeave?.employeeId?.fullName || selectedLeave?.userId?.fullName}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Leave Type: <span className="font-medium text-gray-900 dark:text-white">
                    {getLeaveTypeInfo(selectedLeave?.leaveType).label}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration: <span className="font-medium text-gray-900 dark:text-white">
                    {selectedLeave && formatDate(selectedLeave.startDate)} - {selectedLeave && formatDate(selectedLeave.endDate)} ({selectedLeave?.totalDays} days)
                  </span>
                </p>
              </div>

              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Please provide a reason for rejecting this leave..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprovalAction}
                  disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
                  className={`px-4 py-2 rounded-md font-medium transition duration-200 flex items-center ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'approve' ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                      {actionType === 'approve' ? 'Approve' : 'Reject'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval; 
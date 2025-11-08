// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import Layout from '../components/Layout/Layout';
// import { activityAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const AdminActivityPage = () => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('today');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });
//   const [statisticsPeriod, setStatisticsPeriod] = useState(7);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeDetailDate, setEmployeeDetailDate] = useState(new Date().toISOString().split('T')[0]);

//   // State for different data types
//   const [todayActivity, setTodayActivity] = useState({
//     data: [],
//     summary: {
//       totalUsers: 0,
//       activeUsers: 0,
//       totalActiveTime: 0,
//       averageActiveTime: 0
//     }
//   });
//   const [dateRangeActivity, setDateRangeActivity] = useState([]);
//   const [statistics, setStatistics] = useState({
//     dailyStats: [],
//     userStats: [],
//     period: { startDate: '', endDate: '', days: 0 }
//   });
//   const [employeeDetails, setEmployeeDetails] = useState(null);

//   // Fetch today's activity
//   const fetchTodayActivity = async () => {
//     try {
//       const response = await activityAPI.getAllUsersActivity(selectedDate);
//       if (response.data.success) {
//         setTodayActivity({
//           data: response.data.data || [],
//           summary: response.data.summary || {
//             totalUsers: 0,
//             activeUsers: 0,
//             totalActiveTime: 0,
//             averageActiveTime: 0
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching today activity:', error);
//       toast.error('Failed to fetch today\'s activity data');
//     }
//   };

//   // Fetch date range activity
//   const fetchDateRangeActivity = async () => {
//     try {
//       const response = await activityAPI.getAllUsersActivity(
//         null, 
//         dateRange.startDate, 
//         dateRange.endDate
//       );
//       if (response.data.success) {
//         setDateRangeActivity(response.data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching date range activity:', error);
//       toast.error('Failed to fetch date range activity data');
//     }
//   };

//   // Fetch statistics
//   const fetchStatistics = async () => {
//     try {
//       const response = await activityAPI.getStatistics(statisticsPeriod);
//       if (response.data.success) {
//         setStatistics(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching statistics:', error);
//       toast.error('Failed to fetch activity statistics');
//     }
//   };

//   // Fetch individual employee details
//   const fetchEmployeeDetails = async (userId, date) => {
//     try {
//       const response = await activityAPI.getAllUsersActivity(date);
//       if (response.data.success) {
//         const employeeData = response.data.data.find(emp => emp.userId === userId);
//         setEmployeeDetails(employeeData);
//       }
//     } catch (error) {
//       console.error('Error fetching employee details:', error);
//       toast.error('Failed to fetch employee details');
//     }
//   };

//   // Load data based on active tab
//   const loadData = async () => {
//     setLoading(true);
//     try {
//       switch (activeTab) {
//         case 'today':
//           await fetchTodayActivity();
//           break;
//         case 'range':
//           await fetchDateRangeActivity();
//           break;
//         case 'statistics':
//           await fetchStatistics();
//           break;
//         case 'employee':
//           if (selectedEmployee) {
//             await fetchEmployeeDetails(selectedEmployee.userId, employeeDetailDate);
//           }
//           break;
//         default:
//           await fetchTodayActivity();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load and refresh
//   useEffect(() => {
//     loadData();
    
//     // Auto-refresh every 30 seconds for today's data
//     const interval = setInterval(() => {
//       if (activeTab === 'today') {
//         fetchTodayActivity();
//       }
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [activeTab, selectedDate, dateRange, statisticsPeriod, selectedEmployee, employeeDetailDate]);

//   // Enhanced format duration helper with hours and minutes
//   const formatDuration = (seconds) => {
//     if (!seconds || seconds < 0) return '0m';
    
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     } else {
//       return `${minutes}m`;
//     }
//   };

//   // Format duration with seconds for detailed view
//   const formatDetailedDuration = (seconds) => {
//     if (!seconds || seconds < 0) return '0h 0m 0s';
    
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
    
//     return `${hours}h ${minutes}m ${secs}s`;
//   };

//   // Format date helper
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Format time helper
//   const formatTime = (dateString) => {
//     return new Date(dateString).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Get status badge color
//   const getStatusBadge = (isActive) => {
//     return isActive 
//       ? 'bg-green-100 text-green-800 border-green-200' 
//       : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
//   };

//   // Get role badge color
//   const getRoleBadge = (role) => {
//     const colors = {
//       'Admin': 'bg-red-100 text-red-800 border-red-200',
//       'Manager': 'bg-blue-100 text-blue-800 border-blue-200',
//       'Sales Person': 'bg-green-100 text-green-800 border-green-200',
//       'Lead Person': 'bg-yellow-100 text-yellow-800 border-yellow-200'
//     };
//     return colors[role] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
//   };

//   // Handle employee selection for detailed view
//   const handleEmployeeSelect = (employee) => {
//     setSelectedEmployee(employee);
//     setActiveTab('employee');
//   };

//   if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
//     return (
//       <Layout>
//         <div className="container mx-auto p-6">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//             <h2 className="text-red-800 font-semibold">Access Denied</h2>
//             <p className="text-red-600">You don't have permission to view this page.</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="container mx-auto p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Activity Dashboard</h1>
//             <p className="text-gray-600 dark:text-gray-500 mt-1">Monitor employee CRM usage and productivity</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={loadData}
//               disabled={loading}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
//             >
//               <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//               <span>Refresh</span>
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
//           <nav className="-mb-px flex space-x-8">
//             {[
//               { id: 'today', label: 'Today\'s Activity', icon: '📊' },
//               { id: 'range', label: 'Date Range', icon: '📅' },
//               { id: 'statistics', label: 'Statistics', icon: '📈' },
//               { id: 'employee', label: 'Employee Details', icon: '👤' }
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
//                   activeTab === tab.id
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:border-gray-300 dark:border-slate-600'
//                 }`}
//               >
//                 <span>{tab.icon}</span>
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Today's Activity Tab */}
//         {activeTab === 'today' && (
//           <div className="space-y-6">
//             {/* Date Selector */}
//             <div className="flex items-center space-x-4">
//               <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Select Date:</label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
//               />
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Total Users</p>
//                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayActivity.summary.totalUsers}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Currently Active</p>
//                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayActivity.summary.activeUsers}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Total Active Time</p>
//                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(todayActivity.summary.totalActiveTime)}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-orange-100 rounded-lg">
//                     <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Average Time</p>
//                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(todayActivity.summary.averageActiveTime)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* User Activity Table */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
//               <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Activity Details</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-500">Activity for {formatDate(selectedDate)}</p>
//               </div>
              
//               {loading ? (
//                 <div className="p-8 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="text-gray-600 dark:text-gray-500 mt-2">Loading activity data...</p>
//                 </div>
//               ) : todayActivity.data.length === 0 ? (
//                 <div className="p-8 text-center">
//                   <svg className="w-12 h-12 text-gray-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                   </svg>
//                   <p className="text-gray-600 dark:text-gray-500">No activity data found for this date</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
//                     <thead className="bg-gray-50 dark:bg-slate-800">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">User</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Role</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Sessions</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Last Activity</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
//                       {todayActivity.data.map((activity) => (
//                         <tr key={activity.userId} className="hover:bg-gray-50 dark:bg-slate-800">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.userName}</div>
//                               <div className="text-sm text-gray-500 dark:text-gray-500">{activity.userEmail}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(activity.userRole)}`}>
//                               {activity.userRole}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(activity.isCurrentlyActive)}`}>
//                               {activity.isCurrentlyActive ? '🟢 Active' : '⚫ Offline'}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             <div>
//                               <div className="font-medium">{formatDuration(activity.totalActiveTime)}</div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(activity.totalActiveTime)}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             {activity.sessionsCount}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                             {activity.lastActivity ? formatTime(activity.lastActivity) : 'N/A'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                             <button
//                               onClick={() => handleEmployeeSelect(activity)}
//                               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
//                             >
//                               View Details
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Date Range Tab */}
//         {activeTab === 'range' && (
//           <div className="space-y-6">
//             {/* Date Range Selector */}
//             <div className="flex items-center space-x-4">
//               <label className="text-sm font-medium text-gray-700 dark:text-gray-400">From:</label>
//               <input
//                 type="date"
//                 value={dateRange.startDate}
//                 onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
//                 className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
//               />
//               <label className="text-sm font-medium text-gray-700 dark:text-gray-400">To:</label>
//               <input
//                 type="date"
//                 value={dateRange.endDate}
//                 onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
//                 className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
//               />
//             </div>

//             {/* Date Range Activity Table */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
//               <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity by Date Range</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-500">
//                   {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
//                 </p>
//               </div>
              
//               {loading ? (
//                 <div className="p-8 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="text-gray-600 dark:text-gray-500 mt-2">Loading date range data...</p>
//                 </div>
//               ) : dateRangeActivity.length === 0 ? (
//                 <div className="p-8 text-center">
//                   <svg className="w-12 h-12 text-gray-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                   </svg>
//                   <p className="text-gray-600 dark:text-gray-500">No activity data found for this date range</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
//                     <thead className="bg-gray-50 dark:bg-slate-800">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">User</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Role</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Date</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Sessions</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Last Activity</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
//                       {dateRangeActivity.map((activity, index) => (
//                         <tr key={`${activity.userId}-${activity.date}-${index}`} className="hover:bg-gray-50 dark:bg-slate-800">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.userName}</div>
//                               <div className="text-sm text-gray-500 dark:text-gray-500">{activity.userEmail}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(activity.userRole)}`}>
//                               {activity.userRole}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             {formatDate(activity.date)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             <div>
//                               <div className="font-medium">{formatDuration(activity.totalActiveTime)}</div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(activity.totalActiveTime)}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             {activity.sessionsCount}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                             {activity.lastActivity ? formatTime(activity.lastActivity) : 'N/A'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                             <button
//                               onClick={() => {
//                                 setEmployeeDetailDate(activity.date);
//                                 handleEmployeeSelect(activity);
//                               }}
//                               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
//                             >
//                               View Details
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Statistics Tab */}
//         {activeTab === 'statistics' && (
//           <div className="space-y-6">
//             {/* Period Selector */}
//             <div className="flex items-center space-x-4">
//               <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Period:</label>
//               {[7, 14, 30].map((days) => (
//                 <button
//                   key={days}
//                   onClick={() => setStatisticsPeriod(days)}
//                   className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                     statisticsPeriod === days
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:bg-gray-200 dark:bg-slate-600'
//                   }`}
//                 >
//                   {days} days
//                 </button>
//               ))}
//             </div>

//             {/* Daily Statistics */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
//               <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Daily Activity Trends</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-500">Last {statisticsPeriod} days</p>
//               </div>
              
//               {loading ? (
//                 <div className="p-8 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
//                     <thead className="bg-gray-50 dark:bg-slate-800">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Date</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Users</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Total Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Average Time</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
//                       {statistics.dailyStats.map((day) => (
//                         <tr key={day.date} className="hover:bg-gray-50 dark:bg-slate-800">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                             {formatDate(day.date)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             {day.totalUsers}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             <div>
//                               <div className="font-medium">{formatDuration(day.totalActiveTime)}</div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(day.totalActiveTime)}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             <div>
//                               <div className="font-medium">{formatDuration(day.averageActiveTime)}</div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(day.averageActiveTime)}</div>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>

//             {/* User Statistics */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
//               <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Active Users</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-500">Last {statisticsPeriod} days</p>
//               </div>
              
//               {loading ? (
//                 <div className="p-8 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
//                     <thead className="bg-gray-50 dark:bg-slate-800">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">User</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Role</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Days</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Total Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Daily Average</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
//                       {statistics.userStats.map((user) => (
//                         <tr key={user.userId} className="hover:bg-gray-50 dark:bg-slate-800">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900 dark:text-white">{user.userName}</div>
//                               <div className="text-sm text-gray-500 dark:text-gray-500">{user.userEmail}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(user.userRole)}`}>
//                               {user.userRole}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             {user.totalDays}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             <div>
//                               <div className="font-medium">{formatDuration(user.totalActiveTime)}</div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(user.totalActiveTime)}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                             <div>
//                               <div className="font-medium">{formatDuration(user.averageActiveTime)}</div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(user.averageActiveTime)}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                             <button
//                               onClick={() => handleEmployeeSelect(user)}
//                               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
//                             >
//                               View Details
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Employee Details Tab */}
//         {activeTab === 'employee' && (
//           <div className="space-y-6">
//             {/* Employee and Date Selector */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
//               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Employee Activity Details</h3>
              
//               {/* Date Selector */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Select Date:</label>
//                 <input
//                   type="date"
//                   value={employeeDetailDate}
//                   onChange={(e) => setEmployeeDetailDate(e.target.value)}
//                   className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
//                 />
//               </div>

//               {/* Employee Selector */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Select Employee:</label>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//                   {todayActivity.data.map((employee) => (
//                     <button
//                       key={employee.userId}
//                       onClick={() => handleEmployeeSelect(employee)}
//                       className={`px-3 py-2 rounded-lg text-sm font-medium border ${
//                         selectedEmployee?.userId === employee.userId
//                           ? 'bg-blue-600 text-white border-blue-600'
//                           : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 dark:text-gray-400 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:bg-slate-600'
//                       }`}
//                     >
//                       {employee.userName}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Employee Details Display */}
//             {selectedEmployee && (
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
//                 <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">
//                     {selectedEmployee.userName} - Activity Details
//                   </h3>
//                   <p className="text-sm text-gray-600 dark:text-gray-500">
//                     Activity for {formatDate(employeeDetailDate)}
//                   </p>
//                 </div>
                
//                 {loading ? (
//                   <div className="p-8 text-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="text-gray-600 dark:text-gray-500 mt-2">Loading employee details...</p>
//                   </div>
//                 ) : employeeDetails ? (
//                   <div className="p-6">
//                     {/* Employee Info Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                       <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//                         <div className="text-sm font-medium text-blue-600">Total Active Time</div>
//                         <div className="text-2xl font-bold text-blue-900">
//                           {formatDuration(employeeDetails.totalActiveTime)}
//                         </div>
//                         <div className="text-xs text-blue-600">
//                           {formatDetailedDuration(employeeDetails.totalActiveTime)}
//                         </div>
//                       </div>

//                       <div className="bg-green-50 rounded-lg p-4 border border-green-200">
//                         <div className="text-sm font-medium text-green-600">Sessions</div>
//                         <div className="text-2xl font-bold text-green-900">
//                           {employeeDetails.sessionsCount}
//                         </div>
//                         <div className="text-xs text-green-600">
//                           Total sessions today
//                         </div>
//                       </div>

//                       <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
//                         <div className="text-sm font-medium text-purple-600">Status</div>
//                         <div className="text-lg font-bold text-purple-900">
//                           {employeeDetails.isCurrentlyActive ? '🟢 Active' : '⚫ Offline'}
//                         </div>
//                         <div className="text-xs text-purple-600">
//                           Current status
//                         </div>
//                       </div>

//                       <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
//                         <div className="text-sm font-medium text-orange-600">Last Activity</div>
//                         <div className="text-lg font-bold text-orange-900">
//                           {employeeDetails.lastActivity ? formatTime(employeeDetails.lastActivity) : 'N/A'}
//                         </div>
//                         <div className="text-xs text-orange-600">
//                           Last seen
//                         </div>
//                       </div>
//                     </div>

//                     {/* Employee Information */}
//                     <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
//                       <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Employee Information</h4>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Name:</span>
//                           <span className="ml-2 text-sm text-gray-900 dark:text-white">{employeeDetails.userName}</span>
//                         </div>
//                         <div>
//                           <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Email:</span>
//                           <span className="ml-2 text-sm text-gray-900 dark:text-white">{employeeDetails.userEmail}</span>
//                         </div>
//                         <div>
//                           <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Role:</span>
//                           <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(employeeDetails.userRole)}`}>
//                             {employeeDetails.userRole}
//                           </span>
//                         </div>
//                         <div>
//                           <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Date:</span>
//                           <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatDate(employeeDetails.date)}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Activity Summary */}
//                     <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
//                       <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Activity Summary</h4>
//                       <div className="space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-sm text-gray-600 dark:text-gray-500">Total Active Time:</span>
//                           <span className="text-sm font-medium text-gray-900 dark:text-white">
//                             {formatDetailedDuration(employeeDetails.totalActiveTime)}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-gray-600 dark:text-gray-500">Number of Sessions:</span>
//                           <span className="text-sm font-medium text-gray-900 dark:text-white">
//                             {employeeDetails.sessionsCount}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-gray-600 dark:text-gray-500">Average Session Time:</span>
//                           <span className="text-sm font-medium text-gray-900 dark:text-white">
//                             {employeeDetails.sessionsCount > 0 
//                               ? formatDuration(Math.floor(employeeDetails.totalActiveTime / employeeDetails.sessionsCount))
//                               : '0m'
//                             }
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-gray-600 dark:text-gray-500">Current Status:</span>
//                           <span className={`text-sm font-medium ${employeeDetails.isCurrentlyActive ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
//                             {employeeDetails.isCurrentlyActive ? 'Currently Active' : 'Offline'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="p-8 text-center">
//                     <svg className="w-12 h-12 text-gray-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                     </svg>
//                     <p className="text-gray-600 dark:text-gray-500">No activity data found for this employee on {formatDate(employeeDetailDate)}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default AdminActivityPage; 

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { activityAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminActivityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [statisticsPeriod, setStatisticsPeriod] = useState(7);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetailDate, setEmployeeDetailDate] = useState(new Date().toISOString().split('T')[0]);

  // State for different data types
  const [todayActivity, setTodayActivity] = useState({
    data: [],
    summary: {
      totalUsers: 0,
      activeUsers: 0,
      totalActiveTime: 0,
      averageActiveTime: 0
    }
  });
  const [dateRangeActivity, setDateRangeActivity] = useState([]);
  const [statistics, setStatistics] = useState({
    dailyStats: [],
    userStats: [],
    period: { startDate: '', endDate: '', days: 0 }
  });
  const [employeeDetails, setEmployeeDetails] = useState(null);

  // Fetch today's activity
  const fetchTodayActivity = async () => {
    try {
      const response = await activityAPI.getAllUsersActivity(selectedDate);
      if (response.data.success) {
        setTodayActivity({
          data: response.data.data || [],
          summary: response.data.summary || {
            totalUsers: 0,
            activeUsers: 0,
            totalActiveTime: 0,
            averageActiveTime: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching today activity:', error);
      toast.error('Failed to fetch today\'s activity data');
    }
  };

  // Fetch date range activity
  const fetchDateRangeActivity = async () => {
    try {
      const response = await activityAPI.getAllUsersActivity(
        null, 
        dateRange.startDate, 
        dateRange.endDate
      );
      if (response.data.success) {
        setDateRangeActivity(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching date range activity:', error);
      toast.error('Failed to fetch date range activity data');
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await activityAPI.getStatistics(statisticsPeriod);
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to fetch activity statistics');
    }
  };

  // Fetch individual employee details
  const fetchEmployeeDetails = async (userId, date) => {
    try {
      const response = await activityAPI.getAllUsersActivity(date);
      if (response.data.success) {
        const employeeData = response.data.data.find(emp => emp.userId === userId);
        setEmployeeDetails(employeeData);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to fetch employee details');
    }
  };

  // Load data based on active tab
  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'today':
          await fetchTodayActivity();
          break;
        case 'range':
          await fetchDateRangeActivity();
          break;
        case 'statistics':
          await fetchStatistics();
          break;
        case 'employee':
          if (selectedEmployee) {
            await fetchEmployeeDetails(selectedEmployee.userId, employeeDetailDate);
          }
          break;
        default:
          await fetchTodayActivity();
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds for today's data
    const interval = setInterval(() => {
      if (activeTab === 'today') {
        fetchTodayActivity();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, selectedDate, dateRange, statisticsPeriod, selectedEmployee, employeeDetailDate]);

  // Enhanced format duration helper with hours and minutes
  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Format duration with seconds for detailed view
  const formatDetailedDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0h 0m 0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time helper
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const colors = {
      'Admin': 'bg-red-100 text-red-800 border-red-200',
      'Manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sales Person': 'bg-green-100 text-green-800 border-green-200',
      'Lead Person': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[role] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
  };

  // Handle employee selection for detailed view
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab('employee');
  };

  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Access Denied</h2>
            <p className="text-red-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Activity Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-500 mt-1">Monitor employee CRM usage and productivity</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'today', label: 'Today\'s Activity', icon: '📊' },
              { id: 'range', label: 'Date Range', icon: '📅' },
              { id: 'statistics', label: 'Statistics', icon: '📈' },
              { id: 'employee', label: 'Employee Details', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:border-gray-300 dark:border-slate-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Today's Activity Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayActivity.summary.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Currently Active</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayActivity.summary.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Total Active Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(todayActivity.summary.totalActiveTime)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Average Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(todayActivity.summary.averageActiveTime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Activity Table */}
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Activity Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500">Activity for {formatDate(selectedDate)}</p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-500 mt-2">Loading activity data...</p>
                </div>
              ) : todayActivity.data.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-500">No activity data found for this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Time</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Sessions</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
                      {todayActivity.data.map((activity) => (
                        <tr key={activity.userId} className="hover:bg-gray-50 dark:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.userName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-500">{activity.userEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(activity.userRole)}`}>
                              {activity.userRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(activity.isCurrentlyActive)}`}>
                              {activity.isCurrentlyActive ? '🟢 Active' : '⚫ Offline'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{formatDuration(activity.totalActiveTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(activity.totalActiveTime)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {activity.sessionsCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            {activity.lastActivity ? formatTime(activity.lastActivity) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            <button
                              onClick={() => handleEmployeeSelect(activity)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date Range Tab */}
        {activeTab === 'range' && (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Date Range Activity Table */}
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity by Date Range</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500">
                  {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
                </p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-500 mt-2">Loading date range data...</p>
                </div>
              ) : dateRangeActivity.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-500">No activity data found for this date range</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Time</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Sessions</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
                      {dateRangeActivity.map((activity, index) => (
                        <tr key={`${activity.userId}-${activity.date}-${index}`} className="hover:bg-gray-50 dark:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.userName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-500">{activity.userEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(activity.userRole)}`}>
                              {activity.userRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(activity.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{formatDuration(activity.totalActiveTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(activity.totalActiveTime)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {activity.sessionsCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            {activity.lastActivity ? formatTime(activity.lastActivity) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            <button
                              onClick={() => {
                                setEmployeeDetailDate(activity.date);
                                handleEmployeeSelect(activity);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Period:</label>
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setStatisticsPeriod(days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    statisticsPeriod === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:bg-gray-200 dark:bg-slate-600'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>

            {/* Daily Statistics */}
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Daily Activity Trends</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500">Last {statisticsPeriod} days</p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Users</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Total Time</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Average Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
                      {statistics.dailyStats.map((day) => (
                        <tr key={day.date} className="hover:bg-gray-50 dark:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(day.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {day.totalUsers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{formatDuration(day.totalActiveTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(day.totalActiveTime)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{formatDuration(day.averageActiveTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(day.averageActiveTime)}</div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* User Statistics */}
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Active Users</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500">Last {statisticsPeriod} days</p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Active Days</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Total Time</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Daily Average</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-gray-200 dark:divide-slate-700">
                      {statistics.userStats.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50 dark:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.userName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-500">{user.userEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(user.userRole)}`}>
                              {user.userRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.totalDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{formatDuration(user.totalActiveTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(user.totalActiveTime)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{formatDuration(user.averageActiveTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{formatDetailedDuration(user.averageActiveTime)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            <button
                              onClick={() => handleEmployeeSelect(user)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee Details Tab */}
        {activeTab === 'employee' && (
          <div className="space-y-6">
            {/* Employee and Date Selector */}
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow p-6 border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Employee Activity Details</h3>
              
              {/* Date Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Select Date:</label>
                <input
                  type="date"
                  value={employeeDetailDate}
                  onChange={(e) => setEmployeeDetailDate(e.target.value)}
                  className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Employee Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Select Employee:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {todayActivity.data.map((employee) => (
                    <button
                      key={employee.userId}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                        selectedEmployee?.userId === employee.userId
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 dark:text-gray-400 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:bg-slate-600'
                      }`}
                    >
                      {employee.userName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Details Display */}
            {selectedEmployee && (
              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedEmployee.userName} - Activity Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Activity for {formatDate(employeeDetailDate)}
                  </p>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-500 mt-2">Loading employee details...</p>
                  </div>
                ) : employeeDetails ? (
                  <div className="p-6">
                    {/* Employee Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-sm font-medium text-blue-600">Total Active Time</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatDuration(employeeDetails.totalActiveTime)}
                        </div>
                        <div className="text-xs text-blue-600">
                          {formatDetailedDuration(employeeDetails.totalActiveTime)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-sm font-medium text-green-600">Sessions</div>
                        <div className="text-2xl font-bold text-green-900">
                          {employeeDetails.sessionsCount}
                        </div>
                        <div className="text-xs text-green-600">
                          Total sessions today
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-sm font-medium text-purple-600">Status</div>
                        <div className="text-lg font-bold text-purple-900">
                          {employeeDetails.isCurrentlyActive ? '🟢 Active' : '⚫ Offline'}
                        </div>
                        <div className="text-xs text-purple-600">
                          Current status
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="text-sm font-medium text-orange-600">Last Activity</div>
                        <div className="text-lg font-bold text-orange-900">
                          {employeeDetails.lastActivity ? formatTime(employeeDetails.lastActivity) : 'N/A'}
                        </div>
                        <div className="text-xs text-orange-600">
                          Last seen
                        </div>
                      </div>
                    </div>

                    {/* Employee Information */}
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Employee Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Name:</span>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">{employeeDetails.userName}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Email:</span>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">{employeeDetails.userEmail}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Role:</span>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(employeeDetails.userRole)}`}>
                            {employeeDetails.userRole}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-500">Date:</span>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatDate(employeeDetails.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Activity Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-500">Total Active Time:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDetailedDuration(employeeDetails.totalActiveTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-500">Number of Sessions:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {employeeDetails.sessionsCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-500">Average Session Time:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {employeeDetails.sessionsCount > 0 
                              ? formatDuration(Math.floor(employeeDetails.totalActiveTime / employeeDetails.sessionsCount))
                              : '0m'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-500">Current Status:</span>
                          <span className={`text-sm font-medium ${employeeDetails.isCurrentlyActive ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {employeeDetails.isCurrentlyActive ? 'Currently Active' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-500">No activity data found for this employee on {formatDate(employeeDetailDate)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminActivityPage; 
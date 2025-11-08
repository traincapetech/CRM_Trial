// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import Layout from "../components/Layout/Layout";
// import { useAuth } from "../context/AuthContext";
// import { leadsAPI, salesAPI, authAPI } from "../services/api";
// import { formatCurrency, getDirectSalesCount } from "../utils/helpers";
// import axios from "axios";
// import { componentClasses, darkModeClasses } from '../utils/darkModeClasses';

// import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
// import { FaHistory } from 'react-icons/fa';
// const AdminDashboardPage = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalLeads: 0,
//     totalSales: 0,
//     totalRevenue: 0,
//     totalUsers: 0,
//     recentLeads: [],
//     recentSales: [],
//     userCounts: {
//       salesPerson: 0,
//       leadPerson: 0,
//       manager: 0,
//       admin: 0
//     },
//     leadStages: {
//       'Introduction': 0,
//       'Acknowledgement': 0,
//       'Question': 0,
//       'Future Promise': 0,
//       'Payment': 0,
//       'Analysis': 0
//     }
//   });
//   const [selectedStage, setSelectedStage] = useState('Acknowledgement');
//   const [stageLeads, setStageLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   useEffect(() => {
//     // Update stage leads when selectedStage changes
//     if (stats.totalLeads > 0) {
//       updateStageLeads();
//     }
//   }, [selectedStage]);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch leads data based on user role
//       let leads = [];
//       if (user?.role === 'Sales Person') {
//         // For Sales Persons, fetch only their assigned leads
//         const leadsResponse = await leadsAPI.getAssigned();
//         leads = leadsResponse.data.success ? leadsResponse.data.data : [];
//         console.log(`Sales Person assigned leads:`, leads.length);
//       } else {
//         // For other roles, fetch all leads
//         const leadsResponse = await leadsAPI.getAll();
//         leads = leadsResponse.data.success ? leadsResponse.data.data : [];
//         console.log(`All leads fetched:`, leads.length);
//       }

//       // Initialize variables
//       let salesCount = 0;
//       let sales = [];

//       // NEW APPROACH: Use direct sales count utility
//       try {
//         salesCount = await getDirectSalesCount();
//       } catch (directCountError) {
//         console.error("Error getting direct sales count:", directCountError);
//       }

//       // Still need to fetch sales data for other info
//       try {
//         const salesResponse = await salesAPI.getAll();
//         if (salesResponse.data && salesResponse.data.success) {
//           sales = salesResponse.data.data;
//         }
//       } catch (salesError) {
//         console.error("Error fetching sales data:", salesError);
//       }

//       // Debug logging for sales data structure
//       if (sales.length > 0) {
//         console.log("Sales Data Sample:", sales[0]);
//         console.log("Sales Data Fields:", Object.keys(sales[0]));
//       }

//       // Fetch users data
//       const usersResponse = await authAPI.getUsers();
//       const users = usersResponse.data.success ? usersResponse.data.data : [];

//       // Calculate statistics - use totalCost if amount is not available
//       const totalRevenue = sales.reduce((sum, sale) =>
//         sum + parseFloat(sale.amount || sale.totalCost || 0), 0);

//       // Get recent leads (last 5) - sorted by creation date DESCENDING for most recent first
//       const recentLeads = [...leads]
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .slice(0, 5);

//       // Debug logging for leads dates - More detailed debugging
//       if (recentLeads.length > 0) {
//         console.log("Recent leads date analysis:");
//         recentLeads.forEach((lead, index) => {
//           const createdDate = new Date(lead.createdAt);
//           console.log(`Lead ${index + 1}: ${lead.name}`);
//           console.log(`  - Raw createdAt: ${lead.createdAt}`);
//           console.log(`  - Parsed Date: ${createdDate}`);
//           console.log(`  - Formatted: ${createdDate.toLocaleDateString()}`);
//           console.log(`  - Is valid date: ${!isNaN(createdDate.getTime())}`);
//           console.log(`  - Lead Person: ${lead.leadPerson?.fullName || lead.leadPerson?.name || 'N/A'}`);
//           console.log('---');
//         });
//       }

//       // Get recent sales (last 5) - sorted by creation date DESCENDING for most recent first
//       const recentSales = [...sales]
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .slice(0, 5);

//       // Debug logging for sales data
//       if (recentSales.length > 0) {
//         console.log("Recent sales sample:", recentSales[0]);
//       }

//       // Count users by role
//       const userCounts = {
//         salesPerson: users.filter(u => u.role === "Sales Person").length,
//         leadPerson: users.filter(u => u.role === "Lead Person").length,
//         manager: users.filter(u => u.role === "Manager").length,
//         admin: users.filter(u => u.role === "Admin").length
//       };

//       // Calculate lead stage statistics
//       const leadStages = {
//         'Introduction': leads.filter(lead => lead.status === 'Introduction').length,
//         'Acknowledgement': leads.filter(lead => lead.status === 'Acknowledgement').length,
//         'Question': leads.filter(lead => lead.status === 'Question').length,
//         'Future Promise': leads.filter(lead => lead.status === 'Future Promise').length,
//         'Payment': leads.filter(lead => lead.status === 'Payment').length,
//         'Analysis': leads.filter(lead => lead.status === 'Analysis').length
//       };

//       // Use our direct count instead of sales.length
//       setStats({
//         totalLeads: leads.length,
//         totalSales: salesCount || sales.length,
//         totalRevenue,
//         totalUsers: users.length,
//         recentLeads,
//         recentSales,
//         userCounts,
//         leadStages
//       });

//       // Update stage leads based on selected stage
//       updateStageLeads(leads, selectedStage);

//       setError(null);
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//       setError("Failed to load dashboard data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update leads for selected stage
//   const updateStageLeads = async (allLeads = null, stage = selectedStage) => {
//     try {
//       let leads = allLeads;
//       if (!leads) {
//         if (user?.role === 'Sales Person') {
//           const leadsResponse = await leadsAPI.getAssigned();
//           leads = leadsResponse.data.success ? leadsResponse.data.data : [];
//         } else {
//           const leadsResponse = await leadsAPI.getAll();
//           leads = leadsResponse.data.success ? leadsResponse.data.data : [];
//         }
//       }

//       const filteredLeads = leads.filter(lead => lead.status === stage);
//       setStageLeads(filteredLeads);
//     } catch (error) {
//       console.error('Error filtering leads by stage:', error);
//       setStageLeads([]);
//     }
//   };

//   // Handle stage selection change
//   const handleStageChange = (stage) => {
//     setSelectedStage(stage);
//     updateStageLeads(null, stage);
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <Layout>
//       <div className="container mx-auto p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">
//             {user?.role === 'Lead Person' ? 'Lead Person Dashboard' :
//              user?.role === 'Sales Person' ? 'Sales Person Dashboard' : 'Admin Dashboard'}
//           </h1>
//           <div className="text-sm text-gray-600 dark:text-gray-500">Last updated: {new Date().toLocaleString()}</div>
//         </div>

//         {error && (
//           <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Stats Overview Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               <div className={`${componentClasses.card} rounded-lg p-6`}>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className={`${darkModeClasses.text.muted} text-sm font-medium`}>Total Leads</h3>
//                     <p className="text-3xl font-bold mt-1">{stats.totalLeads}</p>
//                   </div>
//                   <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <Link to="/admin/leads" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Manage leads</Link>
//                 </div>
//               </div>

//               <div className={`${componentClasses.card} rounded-lg p-6`}>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className={`${darkModeClasses.text.muted} text-sm font-medium`}>Total Sales</h3>
//                     <p className="text-3xl font-bold mt-1">{stats.totalSales}</p>
//                   </div>
//                   <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <Link to="/sales-tracking" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all sales</Link>
//                 </div>
//               </div>

//               <div className={`${componentClasses.card} rounded-lg p-6`}>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className={`${darkModeClasses.text.muted} text-sm font-medium`}>Revenue</h3>
//                     <p className="text-3xl font-bold mt-1">${stats.totalRevenue?.toLocaleString() || '0'}</p>
//                   </div>
//                   <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               <div className={`${componentClasses.card} rounded-lg p-6`}>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className={`${darkModeClasses.text.muted} text-sm font-medium`}>Total Users</h3>
//                     <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
//                   </div>
//                   <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <Link to="/admin/users" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Manage users</Link>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Access Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//               {/* Existing quick access cards */}

//               {/* Activity Logs Card */}
//               <Link
//                 to="/admin/activity-logs"
//                 className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
//               >
//                 <div className="flex items-center">
//                   <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
//                     <FaHistory className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Logs</h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Track all system activities</p>
//                   </div>
//                 </div>
//               </Link>
//             </div>

//             {/* Activity Dashboard Card - Only show for Admins and Managers */}
//             {(user?.role === 'Admin' || user?.role === 'Manager') && (
//               <div className={`${componentClasses.card} rounded-lg mb-8`}>
//                 <div className={`px-6 py-4 ${darkModeClasses.border.primary} border-b`}>
//                   <h2 className={`text-lg font-medium ${darkModeClasses.text.heading}`}>Employee Activity Monitoring</h2>
//                 </div>
//                 <div className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-indigo-100 p-3 rounded-full">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h3 className={`text-xl font-semibold ${darkModeClasses.text.heading}`}>Activity Dashboard</h3>
//                         <p className={`${darkModeClasses.text.secondary} mt-1`}>Monitor employee CRM usage time and productivity</p>
//                         <div className={`mt-2 text-sm ${darkModeClasses.text.muted}`}>
//                           • View daily usage time in hours and minutes<br/>
//                           • Track individual employee activity<br/>
//                           • Generate activity reports and analytics
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex flex-col space-y-3">
//                       <Link
//                         to="/admin/activity"
//                         className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center"
//                       >
//                         🕐 Open Activity Dashboard
//                       </Link>
//                       <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
//                         View employee time tracking
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Users Overview - Only show for Admins */}
//             {user?.role === 'Admin' && (
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow mb-8 shadow-sm dark:shadow-black/25">
//                 <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                   <h2 className="text-lg font-medium">Team Overview</h2>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="border rounded-lg p-4 text-center">
//                       <h3 className="text-sm text-gray-500 dark:text-gray-500">Sales Team</h3>
//                       <p className="text-2xl font-bold mt-1">{stats.userCounts.salesPerson}</p>
//                     </div>
//                     <div className="border rounded-lg p-4 text-center">
//                       <h3 className="text-sm text-gray-500 dark:text-gray-500">Lead Team</h3>
//                       <p className="text-2xl font-bold mt-1">{stats.userCounts.leadPerson}</p>
//                     </div>
//                     <div className="border rounded-lg p-4 text-center">
//                       <h3 className="text-sm text-gray-500 dark:text-gray-500">Managers</h3>
//                       <p className="text-2xl font-bold mt-1">{stats.userCounts.manager}</p>
//                     </div>
//                     <div className="border rounded-lg p-4 text-center">
//                       <h3 className="text-sm text-gray-500 dark:text-gray-500">Admins</h3>
//                       <p className="text-2xl font-bold mt-1">{stats.userCounts.admin}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Lead Stage Analytics */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow mb-8 shadow-sm dark:shadow-black/25">
//               <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                 <h2 className="text-lg font-medium">Lead Stage Analytics</h2>
//               </div>
//               <div className="p-6">
//                 {/* Stage Overview Cards */}
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
//                   {Object.entries(stats.leadStages).map(([stage, count]) => (
//                     <div
//                       key={stage}
//                       className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
//                         selectedStage === stage
//                           ? 'border-blue-500 bg-blue-50 shadow-md dark:shadow-xl dark:shadow-black/25'
//                           : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:border-slate-600 hover:shadow-sm dark:shadow-lg dark:shadow-black/25'
//                       }`}
//                       onClick={() => handleStageChange(stage)}
//                     >
//                       <h3 className={`text-sm font-medium ${
//                         selectedStage === stage ? 'text-blue-700' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400'
//                       }`}>
//                         {stage}
//                       </h3>
//                       <p className={`text-2xl font-bold mt-1 ${
//                         selectedStage === stage ? 'text-blue-900' : 'text-gray-900 dark:text-white'
//                       }`}>
//                         {count}
//                       </p>
//                       {selectedStage === stage && (
//                         <div className="mt-2">
//                           <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Stage Selector and Details */}
//                 <div className="border-t pt-6">
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
//                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-0">
//                       {user?.role === 'Lead Person' ? `My leads in "${selectedStage}" Stage` : `Leads in "${selectedStage}" Stage`}
//                     </h3>
//                     <div className="flex items-center space-x-2">
//                       <label htmlFor="stage-select" className="text-sm text-gray-600 dark:text-gray-500">
//                         Select Stage:
//                       </label>
//                       <select
//                         id="stage-select"
//                         value={selectedStage}
//                         onChange={(e) => handleStageChange(e.target.value)}
//                         className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                       >
//                         <option value="Introduction">Introduction</option>
//                         <option value="Acknowledgement">Acknowledgement</option>
//                         <option value="Question">Question</option>
//                         <option value="Future Promise">Future Promise</option>
//                         <option value="Payment">Payment</option>
//                         <option value="Analysis">Analysis</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Stage Details */}
//                   <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-3">
//                       <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
//                         {user?.role === 'Lead Person' ? `My leads in ${selectedStage}:` : `Total leads in ${selectedStage}:`}
//                       </span>
//                       <span className="text-lg font-bold text-blue-600">
//                         {stats.leadStages[selectedStage]} leads
//                       </span>
//                     </div>

//                     {stageLeads.length > 0 ? (
//                       <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                           <thead>
//                             <tr className="border-b border-gray-200 dark:border-slate-700">
//                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Name</th>
//                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Course</th>
//                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Country</th>
//                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Contact</th>
//                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Date</th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
//                             {stageLeads.slice(0, 5).map((lead) => (
//                               <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                                   {lead.name}
//                                 </td>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                                   {lead.course}
//                                 </td>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                                   {lead.country}
//                                 </td>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                                   {lead.contactNumber}
//                                 </td>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                                   {formatDate(lead.createdAt)}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                         {stageLeads.length > 5 && (
//                           <div className="mt-3 text-center">
//                             <Link
//                               to={`/leads?status=${selectedStage}`}
//                               className="text-sm text-blue-600 hover:underline"
//                             >
//                               View all {stageLeads.length} leads in {selectedStage} stage
//                             </Link>
//                           </div>
//                         )}
//                       </div>
//                     ) : (
//                       <div className="text-center py-4">
//                         <p className="text-gray-500 dark:text-gray-500">No leads found in {selectedStage} stage</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Recent Activity */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//               {/* Recent Leads */}
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow shadow-sm dark:shadow-black/25">
//                 <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                   <h2 className="text-lg font-medium">
//                     {user?.role === 'Sales Person' ? 'My Assigned Leads' : 'Recent Leads'}
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   {stats.recentLeads.length === 0 ? (
//                     <p className="text-gray-500 dark:text-gray-500 text-center py-4">No recent leads found</p>
//                   ) : (
//                     <div className="overflow-x-auto">
//                       <table className="min-w-full">
//                         <thead>
//                           <tr className="border-b border-gray-200 dark:border-slate-700">
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Name</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Course</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Date</th>
//                             {user?.role === 'Sales Person' && (
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Lead Person</th>
//                             )}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {stats.recentLeads.map((lead) => (
//                             <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
//                               <td className="px-4 py-3 whitespace-nowrap">{lead.name}</td>
//                               <td className="px-4 py-3 whitespace-nowrap">{lead.course}</td>
//                               <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
//                               {user?.role === 'Sales Person' && (
//                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
//                                   {lead.leadPerson?.fullName || lead.leadPerson?.name || 'N/A'}
//                                 </td>
//                               )}
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                   <div className="mt-4 text-right">
//                     <Link to="/leads" className="text-sm text-blue-600 hover:underline">
//                       {user?.role === 'Sales Person' ? 'View all my leads' : 'View all leads'}
//                     </Link>
//                   </div>
//                 </div>
//               </div>

//               {/* Recent Sales */}
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow shadow-sm dark:shadow-black/25">
//                 <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                   <h2 className="text-lg font-medium">Recent Sales</h2>
//                 </div>
//                 <div className="p-6">
//                   {stats.recentSales.length === 0 ? (
//                     <p className="text-gray-500 dark:text-gray-500 text-center py-4">No recent sales found</p>
//                   ) : (
//                     <div className="overflow-x-auto">
//                       <table className="min-w-full">
//                         <thead>
//                           <tr className="border-b border-gray-200 dark:border-slate-700">
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Customer</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Product</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {stats.recentSales.map((sale) => (
//                             <tr key={sale._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
//                               <td className="px-4 py-3 whitespace-nowrap">
//                                 {sale.leadId?.name || sale.leadId?.NAME || sale.customerName || sale.leadName || 'N/A'}
//                               </td>
//                               <td className="px-4 py-3 whitespace-nowrap">
//                                 {sale.product || sale.course || sale.productName || 'N/A'}
//                               </td>
//                               <td className="px-4 py-3 whitespace-nowrap">
//                                 {formatCurrency(sale.amount || sale.totalCost || sale.price || 0)}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                   <div className="mt-4 text-right">
//                     <Link to="/sales-tracking" className="text-sm text-blue-600 hover:underline">
//                       View all sales
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700 rounded-lg shadow shadow-sm dark:shadow-black/25">
//               <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
//                 <h2 className="text-lg font-medium">Quick Actions</h2>
//               </div>
//               <div className="p-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   {user?.role === 'Admin' ? (
//                     <>
//                       <Link to="/admin/users" className="bg-blue-50 hover:bg-blue-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Manage Users</span>
//                         </div>
//                       </Link>
//                       <Link to="/admin/leads" className="bg-green-50 hover:bg-green-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Manage Leads</span>
//                         </div>
//                       </Link>
//                       <Link to="/admin/reports" className="bg-purple-50 hover:bg-purple-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">View Reports</span>
//                         </div>
//                       </Link>
//                       <Link to="/sales-tracking" className="bg-yellow-50 hover:bg-yellow-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Sales Tracking</span>
//                         </div>
//                       </Link>
//                     </>
//                   ) : (
//                     <>
//                       <Link to="/leads" className="bg-blue-50 hover:bg-blue-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Manage Leads</span>
//                         </div>
//                       </Link>
//                       <Link to="/admin/import" className="bg-green-50 hover:bg-green-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Import Data</span>
//                         </div>
//                       </Link>
//                       <Link to="/lead-sales-sheet" className="bg-purple-50 hover:bg-purple-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Sales Sheet</span>
//                         </div>
//                       </Link>
//                       <Link to="/tasks" className="bg-yellow-50 hover:bg-yellow-100 transition p-4 rounded-lg text-center">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                           </svg>
//                           <span className="text-gray-800 dark:text-gray-200 font-medium">Tasks</span>
//                         </div>
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default AdminDashboardPage;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { leadsAPI, salesAPI, authAPI, currencyAPI } from "../services/api";
import api from "../services/api";
import { formatCurrency, getDirectSalesCount } from "../utils/helpers";
import axios from "axios";
import { componentClasses, darkModeClasses } from "../utils/darkModeClasses";

import {
  professionalClasses,
  transitions,
  shadows,
} from "../utils/professionalDarkMode";
import { FaHistory } from "react-icons/fa";
const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentLeads: [],
    recentSales: [],
    userCounts: {
      salesPerson: 0,
      leadPerson: 0,
      manager: 0,
      admin: 0,
    },
    itStats: {
      itManager: 0,
      itIntern: 0,
      itPermanent: 0,
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
    },
    leadStages: {
      Introduction: 0,
      Acknowledgement: 0,
      Question: 0,
      "Future Promise": 0,
      Payment: 0,
      Analysis: 0,
    },
  });
  const [selectedStage, setSelectedStage] = useState("Acknowledgement");
  const [stageLeads, setStageLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    fetchDashboardData();
    loadExchangeRates();
  }, []);

  useEffect(() => {
    // Update stage leads when selectedStage changes
    if (stats.totalLeads > 0) {
      updateStageLeads();
    }
  }, [selectedStage]);

  // Load exchange rates from API
  const loadExchangeRates = async () => {
    try {
      const response = await currencyAPI.getRates();
      if (response.data && response.data.rates) {
        setExchangeRates(response.data.rates);
      }
    } catch (error) {
      console.error("Error loading exchange rates:", error);
      // Use default rates as fallback
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        INR: 83.12,
        CAD: 1.36,
        AUD: 1.52,
        JPY: 149.5,
        CNY: 7.24,
      });
    }
  };

  // Convert amount to USD for consistent revenue calculation
  const convertToUSD = (amount, fromCurrency) => {
    if (!amount || isNaN(amount)) return 0;

    const rates = exchangeRates;

    // If already USD, return as is
    if (fromCurrency === "USD") return parseFloat(amount);

    // If exchange rates are not loaded yet, use fallback rates (updated to current rates)
    if (!rates || Object.keys(rates).length === 0) {
      const fallbackRates = {
        INR: 88.02, // Updated to current rate
        EUR: 0.92,
        GBP: 0.79,
        CAD: 1.37,
        AUD: 1.51,
        JPY: 150.25,
        CNY: 7.15,
      };
      const rate = fallbackRates[fromCurrency] || 1;
      return parseFloat(amount) / rate;
    }

    // If rate is available, use it, otherwise use a default 1:1 rate
    const rate =
      rates[fromCurrency] !== undefined && !isNaN(rates[fromCurrency])
        ? rates[fromCurrency]
        : 1;
    return parseFloat(amount) / rate;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch leads data based on user role
      let leads = [];
      if (user?.role === "Sales Person") {
        // For Sales Persons, fetch only their assigned leads
        const leadsResponse = await leadsAPI.getAssigned();
        leads = leadsResponse.data.success ? leadsResponse.data.data : [];
        console.log(`Sales Person assigned leads:`, leads.length);
      } else {
        // For other roles, fetch all leads
        const leadsResponse = await leadsAPI.getAll();
        leads = leadsResponse.data.success ? leadsResponse.data.data : [];
        console.log(`All leads fetched:`, leads.length);
      }

      // Initialize variables
      let salesCount = 0;
      let sales = [];

      // NEW APPROACH: Use direct sales count utility
      try {
        salesCount = await getDirectSalesCount();
      } catch (directCountError) {
        console.error("Error getting direct sales count:", directCountError);
      }

      // Still need to fetch sales data for other info
      try {
        const salesResponse = await salesAPI.getAll();
        if (salesResponse.data && salesResponse.data.success) {
          sales = salesResponse.data.data;
        }
      } catch (salesError) {
        console.error("Error fetching sales data:", salesError);
      }

      // Debug logging for sales data structure
      if (sales.length > 0) {
        console.log("Sales Data Sample:", sales[0]);
        console.log("Sales Data Fields:", Object.keys(sales[0]));
      }

      // Fetch users data
      const usersResponse = await authAPI.getUsers();
      const users = usersResponse.data.success ? usersResponse.data.data : [];

      // Calculate statistics - convert all amounts to USD before summing
      const totalRevenue = sales.reduce((sum, sale) => {
        // Get the main amount (totalCost is the primary revenue field)
        const amount = sale.totalCost || sale.amount || 0;

        // Determine the currency for this amount
        // Priority: totalCostCurrency > currency > USD (default)
        const currency = sale.totalCostCurrency || sale.currency || "USD";

        const amountInUSD = convertToUSD(amount, currency);

        // Debug logging for currency conversion
        if (currency !== "USD" && amount > 0) {
          console.log(
            `Converting ${amount} ${currency} to USD: ${amountInUSD}`
          );
        }

        return sum + amountInUSD;
      }, 0);

      // Log total revenue calculation summary
      console.log(`🏢 Admin Dashboard - Total Revenue Calculation Summary:`);
      console.log(`- Total Sales Records: ${sales.length}`);
      console.log(
        `- Total Revenue (converted to USD): $${totalRevenue.toFixed(2)}`
      );
      console.log(
        `- Exchange Rates Available:`,
        exchangeRates ? Object.keys(exchangeRates) : "No exchange rates loaded"
      );
      console.log(`- Exchange Rates Values:`, exchangeRates);

      // Test conversion for debugging
      if (exchangeRates && exchangeRates.INR) {
        console.log(
          "🧪 Dashboard Test: 1000 INR to USD:",
          convertToUSD(1000, "INR")
        );
        console.log(
          "🧪 Dashboard Test: 712085 INR to USD:",
          convertToUSD(712085, "INR")
        );
      }

      // Get recent leads (last 5) - sorted by creation date DESCENDING for most recent first
      const recentLeads = [...leads]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Debug logging for leads dates - More detailed debugging
      if (recentLeads.length > 0) {
        console.log("Recent leads date analysis:");
        recentLeads.forEach((lead, index) => {
          const createdDate = new Date(lead.createdAt);
          console.log(`Lead ${index + 1}: ${lead.name}`);
          console.log(`  - Raw createdAt: ${lead.createdAt}`);
          console.log(`  - Parsed Date: ${createdDate}`);
          console.log(`  - Formatted: ${createdDate.toLocaleDateString()}`);
          console.log(`  - Is valid date: ${!isNaN(createdDate.getTime())}`);
          console.log(
            `  - Lead Person: ${
              lead.leadPerson?.fullName || lead.leadPerson?.name || "N/A"
            }`
          );
          console.log("---");
        });
      }

      // Get recent sales (last 5) - sorted by creation date DESCENDING for most recent first
      const recentSales = [...sales]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Debug logging for sales data
      if (recentSales.length > 0) {
        console.log("Recent sales sample:", recentSales[0]);
      }

      // Count users by role
      const userCounts = {
        salesPerson: users.filter((u) => u.role === "Sales Person").length,
        leadPerson: users.filter((u) => u.role === "Lead Person").length,
        manager: users.filter((u) => u.role === "Manager").length,
        admin: users.filter((u) => u.role === "Admin").length,
      };

      // Fetch IT Department stats
      let itStats = {
        itManager: 0,
        itIntern: 0,
        itPermanent: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
      };

      try {
        // IT Users
        const itManagerCount = users.filter((u) => u.role === "IT Manager").length;
        const itInternCount = users.filter((u) => u.role === "IT Intern").length;
        const itPermanentCount = users.filter((u) => u.role === "IT Permanent").length;

        // IT Projects
        const projectsResponse = await api.get('/it-projects');
        const projects = projectsResponse.data?.data || [];
        const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
        const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

        // IT Tasks - only fetch IT department tasks
        const tasksResponse = await api.get('/tasks?department=IT');
        const tasks = tasksResponse.data?.data || [];
        const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
        const completedTasks = tasks.filter(t => t.status === 'Manager Confirmed' || t.status === 'Employee Completed').length;

        itStats = {
          itManager: itManagerCount,
          itIntern: itInternCount,
          itPermanent: itPermanentCount,
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
          totalTasks: tasks.length,
          pendingTasks,
          completedTasks,
        };
      } catch (itError) {
        console.error('Error fetching IT stats:', itError);
      }

      // Calculate lead stage statistics
      const leadStages = {
        Introduction: leads.filter((lead) => lead.status === "Introduction")
          .length,
        Acknowledgement: leads.filter(
          (lead) => lead.status === "Acknowledgement"
        ).length,
        Question: leads.filter((lead) => lead.status === "Question").length,
        "Future Promise": leads.filter(
          (lead) => lead.status === "Future Promise"
        ).length,
        Payment: leads.filter((lead) => lead.status === "Payment").length,
        Analysis: leads.filter((lead) => lead.status === "Analysis").length,
      };

      // Use our direct count instead of sales.length
      setStats({
        totalLeads: leads.length,
        totalSales: salesCount || sales.length,
        totalRevenue,
        totalUsers: users.length,
        recentLeads,
        recentSales,
        userCounts,
        itStats,
        leadStages,
      });

      // Update stage leads based on selected stage
      updateStageLeads(leads, selectedStage);

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update leads for selected stage
  const updateStageLeads = async (allLeads = null, stage = selectedStage) => {
    try {
      let leads = allLeads;
      if (!leads) {
        if (user?.role === "Sales Person") {
          const leadsResponse = await leadsAPI.getAssigned();
          leads = leadsResponse.data.success ? leadsResponse.data.data : [];
        } else {
          const leadsResponse = await leadsAPI.getAll();
          leads = leadsResponse.data.success ? leadsResponse.data.data : [];
        }
      }

      const filteredLeads = leads.filter((lead) => lead.status === stage);
      setStageLeads(filteredLeads);
    } catch (error) {
      console.error("Error filtering leads by stage:", error);
      setStageLeads([]);
    }
  };

  // Handle stage selection change
  const handleStageChange = (stage) => {
    setSelectedStage(stage);
    updateStageLeads(null, stage);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {user?.role === "Lead Person"
                    ? "Lead Person Dashboard"
                    : user?.role === "Sales Person"
                    ? "Sales Person Dashboard"
                    : "Admin Dashboard"}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  Welcome back,{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.fullName}
                  </span>
                  ! Here's what's happening with your CRM today.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Modern Stats Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Leads Card */}
                <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.totalLeads}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Leads
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/admin/leads"
                      className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    >
                      Manage leads
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Total Sales Card */}
                <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.totalSales}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Sales
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/sales-tracking"
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                    >
                      View all sales
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Revenue Card */}
                {/* <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${stats.totalRevenue?.toLocaleString() || "0"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Revenue
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/sales-tracking"
                      className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                    >
                      View revenue
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div> */}

                {/* Total Users Card */}
                <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.totalUsers}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Users
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/admin/users"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Manage users
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Modern Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Activity Logs Card */}
                <Link
                  to="/admin/activity-logs"
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                        <FaHistory className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Activity Logs
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Track all system activities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      View logs
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Lead Sales Sheet Card */}
                <Link
                  to="/lead-sales-sheet"
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Lead Sales Sheet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          View all lead person sales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                      View sheet
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Task Management Card */}
                <Link
                  to="/tasks"
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Task Management
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Manage and track tasks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors">
                      View tasks
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Activity Dashboard Card - Only show for Admins and Managers */}
              {(user?.role === "Admin" || user?.role === "Manager") && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md dark:shadow-black/25 mb-8 transition-all duration-200 ease-out">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Employee Activity Monitoring
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* Left Section */}
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 p-4 rounded-full shadow-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Activity Dashboard
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Monitor employee CRM usage time and productivity
                          </p>
                          <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                            <li>View daily usage time in hours and minutes</li>
                            <li>Track individual employee activity</li>
                            <li>Generate activity reports and analytics</li>
                          </ul>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-center space-y-3">
                        <Link
                          to="/admin/activity"
                          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md w-full text-center"
                        >
                          🕐 Open Activity Dashboard
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-500 text-center">
                          View employee time tracking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modern Team Overview - Only show for Admins */}
              {user?.role === "Admin" && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 mb-8 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                      Team Overview
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      Your organization's team composition
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Sales Team
                          </h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.userCounts.salesPerson}
                          </p>
                        </div>
                      </div>

                      <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Lead Team
                          </h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.userCounts.leadPerson}
                          </p>
                        </div>
                      </div>

                      <div className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Managers
                          </h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.userCounts.manager}
                          </p>
                        </div>
                      </div>

                      <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 text-center border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Admins
                          </h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.userCounts.admin}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IT Department Overview Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">IT Department Overview</h2>
                      <p className="text-indigo-100 text-sm mt-1">
                        Track IT team, projects, and tasks
                      </p>
                    </div>
                    <Link
                      to="/it"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      View IT Dashboard
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {/* IT Team Stats */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">IT Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IT Managers</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.itStats.itManager}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IT Interns</p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.itStats.itIntern}</p>
                          </div>
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IT Permanent</p>
                            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.itStats.itPermanent}</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IT Projects & Tasks Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">IT Projects</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.itStats.totalProjects}</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Active</span>
                            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.itStats.activeProjects}</span>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Completed</span>
                            <span className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.itStats.completedProjects}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">IT Tasks</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.itStats.totalTasks}</span>
                          </div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</span>
                            <span className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.itStats.pendingTasks}</span>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Completed</span>
                            <span className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.itStats.completedTasks}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Lead Stage Analytics */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Lead Stage Analytics
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    Track leads through the sales pipeline
                  </p>
                </div>
                <div className="p-6">
                  {/* Modern Stage Overview Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {Object.entries(stats.leadStages).map(([stage, count]) => (
                      <div
                        key={stage}
                        className={`group relative rounded-xl p-4 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                          selectedStage === stage
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105"
                            : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 hover:shadow-md border border-gray-200 dark:border-slate-600"
                        }`}
                        onClick={() => handleStageChange(stage)}
                      >
                        <div
                          className={`text-sm font-medium mb-2 ${
                            selectedStage === stage
                              ? "text-blue-100"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {stage}
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            selectedStage === stage
                              ? "text-white"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {count}
                        </div>
                        {selectedStage === stage && (
                          <div className="mt-2">
                            <div className="w-2 h-2 bg-white rounded-full mx-auto animate-pulse"></div>
                          </div>
                        )}
                        {selectedStage !== stage && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Stage Selector and Details */}
                  <div className="border-t pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-0">
                        {user?.role === "Lead Person"
                          ? `My leads in "${selectedStage}" Stage`
                          : `Leads in "${selectedStage}" Stage`}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="stage-select"
                          className="text-sm text-gray-600 dark:text-gray-500"
                        >
                          Select Stage:
                        </label>
                        <select
                          id="stage-select"
                          value={selectedStage}
                          onChange={(e) => handleStageChange(e.target.value)}
                          className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:border-green-400 focus:ring-offset-2 focus:border-green-500"
                        >
                          <option value="Introduction">Introduction</option>
                          <option value="Acknowledgement">
                            Acknowledgement
                          </option>
                          <option value="Question">Question</option>
                          <option value="Future Promise">Future Promise</option>
                          <option value="Payment">Payment</option>
                          <option value="Analysis">Analysis</option>
                        </select>
                      </div>
                    </div>

                    {/* Stage Details */}
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                          {user?.role === "Lead Person"
                            ? `My leads in ${selectedStage}:`
                            : `Total leads in ${selectedStage}:`}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {stats.leadStages[selectedStage]} leads
                        </span>
                      </div>

                      {stageLeads.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-slate-700">
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                  Course
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                  Country
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                              {stageLeads.slice(0, 5).map((lead) => (
                                <tr
                                  key={lead._id}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {lead.name}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                                    {lead.course}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                                    {lead.country}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                                    {lead.contactNumber}
                                  </td>

                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                                    {formatDate(lead.createdAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {stageLeads.length > 5 && (
                            <div className="mt-3 text-center">
                              <Link
                                to={`/leads?status=${selectedStage}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View all {stageLeads.length} leads in{" "}
                                {selectedStage} stage
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-gray-500">
                            No leads found in {selectedStage} stage
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Leads */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                      {user?.role === "Sales Person"
                        ? "My Assigned Leads"
                        : "Recent Leads"}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Latest lead activities
                    </p>
                  </div>
                  <div className="p-6">
                    {stats.recentLeads.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          No recent leads found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentLeads.map((lead, index) => (
                          <div
                            key={lead._id}
                            className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-slate-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {lead.name || "Unnamed Lead"}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {lead.course || "No course specified"}
                                </p>
                                {user?.role === "Sales Person" && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Lead Person:{" "}
                                    {lead.leadPerson?.fullName ||
                                      lead.leadPerson?.name ||
                                      "Unassigned"}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(lead.createdAt)}
                                </div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 text-center">
                      <Link
                        to="/leads"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {user?.role === "Sales Person"
                          ? "View all my leads"
                          : "View all leads"}
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                      Recent Sales
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      Latest sales transactions
                    </p>
                  </div>
                  <div className="p-6">
                    {stats.recentSales.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          No recent sales found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentSales.map((sale, index) => (
                          <div
                            key={sale._id}
                            className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-slate-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {sale.leadId?.name ||
                                    sale.leadId?.NAME ||
                                    sale.customerName ||
                                    sale.leadName ||
                                    "Unknown Customer"}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {sale.product ||
                                    sale.course ||
                                    sale.productName ||
                                    "No product specified"}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(
                                    sale.amount ||
                                      sale.totalCost ||
                                      sale.price ||
                                      0
                                  )}
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 text-center">
                      <Link
                        to="/sales-tracking"
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        View all sales
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Quick Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Quick Actions
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Access frequently used features
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {user?.role === "Admin" ? (
                      <>
                        <Link
                          to="/admin/users"
                          className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-blue-200 dark:border-blue-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Manage Users
                          </span>
                        </Link>
                        <Link
                          to="/admin/leads"
                          className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-green-200 dark:border-green-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Manage Leads
                          </span>
                        </Link>
                        <Link
                          to="/admin/reports"
                          className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-purple-200 dark:border-purple-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            View Reports
                          </span>
                        </Link>
                        <Link
                          to="/sales-tracking"
                          className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-yellow-200 dark:border-yellow-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Sales Tracking
                          </span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/leads"
                          className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-blue-200 dark:border-blue-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Manage Leads
                          </span>
                        </Link>
                        <Link
                          to="/admin/import"
                          className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-green-200 dark:border-green-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Import Data
                          </span>
                        </Link>
                        <Link
                          to="/lead-sales-sheet"
                          className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-purple-200 dark:border-purple-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Sales Sheet
                          </span>
                        </Link>
                        <Link
                          to="/tasks"
                          className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-yellow-200 dark:border-yellow-700"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                            Tasks
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;

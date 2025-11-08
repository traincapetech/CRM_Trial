// // src/pages/LeadsPage.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { leadsAPI } from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import LeadForm from "../components/Leads/LeadForm";
// import Layout from "../components/Layout/Layout";
// import AOS from 'aos';
// import 'aos/dist/aos.css';
// import { FaEdit, FaTrash, FaFilter, FaPlus } from 'react-icons/fa';
// import { toast } from 'react-hot-toast';
// import LoggingService from '../services/loggingService'; // Add LoggingService import
// import LoadingSpinner from '../components/ui/LoadingSpinner';

// import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';

// const LeadsPage = () => {
//   const { user } = useAuth();
//   const [leads, setLeads] = useState([]);
//   const [filteredLeads, setFilteredLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);

//   // Date filtering state - Default to current month instead of March 2025
//   const currentDate = new Date();
//   const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1); // Current month
//   const [filterYear, setFilterYear] = useState(currentDate.getFullYear()); // Current year
//   const [showCurrentMonth, setShowCurrentMonth] = useState(true); // Show current month by default

//   // Generate month options
//   const months = [
//     { value: 1, label: "January" },
//     { value: 2, label: "February" },
//     { value: 3, label: "March" },
//     { value: 4, label: "April" },
//     { value: 5, label: "May" },
//     { value: 6, label: "June" },
//     { value: 7, label: "July" },
//     { value: 8, label: "August" },
//     { value: 9, label: "September" },
//     { value: 10, label: "October" },
//     { value: 11, label: "November" },
//     { value: 12, label: "December" }
//   ];

//   // Generate year options (include current year + 1 and 5 years back)
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i); // Include next year and 5 years back

//   // Function to fetch leads from the API
//   const fetchLeads = useCallback(async () => {
//     try {
//       setLoading(true);
//       console.log('Current user:', user);

//       // EMERGENCY FIX: Remove date filtering to show all leads
//       console.log('Fetching ALL leads without date filters');
//       const response = await leadsAPI.getAll({});
//       console.log('API Response:', response.data);

//       // Log the structure of the first lead to see available fields
//       if (response.data && response.data.data && response.data.data.length > 0) {
//         const firstLead = response.data.data[0];
//         console.log('First lead object structure:', firstLead);
//         console.log('All field names:', Object.keys(firstLead));
//         console.log('Name value:', firstLead.name);
//         console.log('NAME value:', firstLead.NAME);
//       }

//       // Set leads directly from API (no frontend filtering needed)
//       setLeads(response.data.data || []);
//       setFilteredLeads(response.data.data || []);
//       console.log('Leads set in state:', response.data.data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching leads:", err);
//       setError("Failed to load leads. Please try again.");
//       // Set empty arrays to prevent undefined errors
//       setLeads([]);
//       setFilteredLeads([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   // Fetch leads on component mount only
//   useEffect(() => {
//     console.log('Component mounted, fetching all leads');
//     fetchLeads();
//   }, [fetchLeads]);

//   // Filter leads based on selected month and year
//   useEffect(() => {
//     if (leads.length === 0) return;

//     console.log('Filtering leads for:', { filterMonth, filterYear, showCurrentMonth });

//     let filtered = leads;

//     if (showCurrentMonth) {
//       // Filter for current month
//       const currentDate = new Date();
//       const currentMonth = currentDate.getMonth() + 1;
//       const currentYear = currentDate.getFullYear();

//       filtered = leads.filter(lead => {
//         const leadDate = new Date(lead.createdAt);
//         const leadMonth = leadDate.getMonth() + 1;
//         const leadYear = leadDate.getFullYear();
//         return leadMonth === currentMonth && leadYear === currentYear;
//       });
//     } else {
//       // Filter for selected month/year
//       filtered = leads.filter(lead => {
//         const leadDate = new Date(lead.createdAt);
//         const leadMonth = leadDate.getMonth() + 1;
//         const leadYear = leadDate.getFullYear();
//         return leadMonth === filterMonth && leadYear === filterYear;
//       });
//     }

//     console.log(`Filtered ${filtered.length} leads from ${leads.length} total leads`);
//     setFilteredLeads(filtered);
//   }, [leads, filterMonth, filterYear, showCurrentMonth]);

//   // Note: Date filtering is now handled on the backend via API query parameters
//   // This ensures sales persons only receive leads for the selected time period
//   // instead of loading all leads and filtering on frontend

//   // Debug function to log current state
//   const debugCurrentState = useCallback(() => {
//     console.log('============= DEBUG CURRENT STATE =============');
//     console.log('Current leads count:', leads.length);
//     console.log('Current filteredLeads count:', filteredLeads.length);
//     console.log('Filter settings:', { filterMonth, filterYear, showCurrentMonth });
//     console.log('Selected lead:', selectedLead);
//     console.log('Current date:', new Date());
//     console.log('Filter date range:', {
//       start: showCurrentMonth
//         ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
//         : new Date(filterYear, filterMonth - 1, 1),
//       end: showCurrentMonth
//         ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
//         : new Date(filterYear, filterMonth, 0)
//     });
//     console.log('First 3 leads in leads array:', leads.slice(0, 3).map(l => ({
//       id: l._id,
//       name: l.name,
//       createdAt: l.createdAt,
//       createdAtFormatted: new Date(l.createdAt).toLocaleDateString(),
//       month: new Date(l.createdAt).getMonth() + 1,
//       year: new Date(l.createdAt).getFullYear()
//     })));
//     console.log('First 3 leads in filteredLeads array:', filteredLeads.slice(0, 3).map(l => ({
//       id: l._id,
//       name: l.name,
//       createdAt: l.createdAt,
//       createdAtFormatted: new Date(l.createdAt).toLocaleDateString(),
//       month: new Date(l.createdAt).getMonth() + 1,
//       year: new Date(l.createdAt).getFullYear()
//     })));
//     console.log('============= END DEBUG STATE =============');
//   }, [leads, filteredLeads, filterMonth, filterYear, showCurrentMonth, selectedLead]);

//   // Force refetch function that bypasses all caching
//   const forceRefetch = useCallback(async () => {
//     console.log('=== FORCE REFETCH TRIGGERED ===');
//     setLoading(true);
//     try {
//       // Clear current state first
//       setLeads([]);
//       setFilteredLeads([]);

//       // Wait a moment to ensure state is cleared
//       await new Promise(resolve => setTimeout(resolve, 100));

//       // Fetch fresh data
//       await fetchLeads();

//       toast.success('Data refreshed successfully!');
//     } catch (error) {
//       console.error('Force refetch failed:', error);
//       toast.error('Failed to refresh data');
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchLeads]);

//   // Function to handle successful lead creation/update
//   const handleLeadSuccess = useCallback(async (lead) => {
//     console.log('============= HANDLE LEAD SUCCESS =============');
//     console.log('Lead success callback called with:', lead);

//     if (selectedLead) {
//       console.log('Lead updated successfully');

//       // Log lead update
//       try {
//         await LoggingService.logLeadUpdate(lead._id, lead);
//       } catch (logError) {
//         console.error('Error logging lead update:', logError);
//       }

//       setSelectedLead(null);

//       // Show success message immediately
//       toast.success('Lead updated successfully!');

//       // Simple solution: Just refetch the data
//       fetchLeads();

//     } else {
//       // Add new lead
//       console.log('Adding new lead to list');

//       // Log lead creation
//       try {
//         await LoggingService.logLeadCreate(lead);
//       } catch (logError) {
//         console.error('Error logging lead creation:', logError);
//       }

//       setShowAddForm(false);
//       fetchLeads();
//       toast.success('Lead created successfully!');
//     }

//     console.log('============= END HANDLE LEAD SUCCESS =============');
//   }, [selectedLead, fetchLeads]);

//   // Handle month change
//   const handleMonthChange = (e) => {
//     const newMonth = parseInt(e.target.value);
//     console.log("Changing month to:", newMonth);
//     setFilterMonth(newMonth);
//     setShowCurrentMonth(false);
//   };

//   // Handle year change
//   const handleYearChange = (e) => {
//     const newYear = parseInt(e.target.value);
//     console.log("Changing year to:", newYear);
//     setFilterYear(newYear);
//     setShowCurrentMonth(false);
//   };

//   // Handle reset to current month
//   const handleResetToCurrentMonth = () => {
//     setFilterMonth(new Date().getMonth() + 1);
//     setFilterYear(new Date().getFullYear());
//     setShowCurrentMonth(true);
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   // Add AOS initialization in useEffect
//   useEffect(() => {
//     AOS.init({
//       duration: 600,
//       easing: 'ease-in-out',
//       once: true
//     });
//   }, []);

//   // Handle edit button click
//   const handleEditClick = (lead) => {
//     console.log("Edit clicked for lead:", lead);
//     setSelectedLead(lead);
//   };

//   // Function to analyze date ranges in leads data
//   const analyzeDateRanges = (leadsData) => {
//     if (!leadsData || leadsData.length === 0) return null;

//     const dateRanges = {};
//     leadsData.forEach(lead => {
//       const date = new Date(lead.createdAt);
//       const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
//       const monthName = months[date.getMonth()].label;
//       const year = date.getFullYear();

//       if (!dateRanges[monthYear]) {
//         dateRanges[monthYear] = {
//           month: date.getMonth() + 1,
//           year: year,
//           monthName: monthName,
//           count: 0,
//           leads: []
//         };
//       }
//       dateRanges[monthYear].count++;
//       dateRanges[monthYear].leads.push(lead);
//     });

//     return dateRanges;
//   };

//   // Function to get date range suggestions
//   const getDateRangeSuggestions = () => {
//     const ranges = analyzeDateRanges(leads);
//     if (!ranges) return null;

//     const sortedRanges = Object.values(ranges).sort((a, b) => {
//       if (a.year !== b.year) return b.year - a.year;
//       return b.month - a.month;
//     });

//     return sortedRanges.slice(0, 3); // Top 3 date ranges
//   };

//   // Add logging for lead assignment if there's a function that handles it
//   const handleLeadAssign = async (leadId, newAssignee) => {
//     try {
//       const lead = leads.find(l => l._id === leadId);
//       const previousAssignee = lead?.assignedTo;

//       const response = await leadsAPI.update(leadId, { assignedTo: newAssignee });

//       if (response.data.success) {
//         // Log the lead assignment
//         try {
//           await LoggingService.logLeadAssign(leadId, newAssignee, previousAssignee);
//         } catch (logError) {
//           console.error('Error logging lead assignment:', logError);
//         }

//         toast.success('Lead assigned successfully');
//         fetchLeads();
//       }
//     } catch (error) {
//       console.error('Error assigning lead:', error);
//       toast.error('Failed to assign lead');
//     }
//   };

//   return (
//     <Layout>
//       <div className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out min-h-screen pb-12">
//         {/* Header with gradient background */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 mb-8">
//           <div className="container mx-auto">
//             <div className="flex flex-col md:flex-row justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold text-white mb-2">Leads Management</h1>
//                 <p className="text-blue-100 text-sm md:text-base">
//                   {filteredLeads.length} leads • {showCurrentMonth ? 'Current Month' : `${months.find(m => m.value === parseInt(filterMonth))?.label} ${filterYear}`}
//                 </p>
//               </div>

//               <button
//                 onClick={() => setShowAddForm(true)}
//                 className="mt-4 md:mt-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out duration-300 flex items-center font-medium shadow-sm"
//               >
//                 <FaPlus className="h-4 w-4 mr-2" />
//                 Add New Lead
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="container mx-auto px-4">
//           {/* Error message */}
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm dark:shadow-black/25">
//               <div className="flex items-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//                 {error}
//               </div>
//             </div>
//           )}

//           {/* Add/Edit Lead Form */}
//           {(showAddForm || selectedLead) && (
//             <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-xl shadow-md dark:shadow-black/25 overflow-hidden mb-8">
//               <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
//                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
//                   {selectedLead ? "Edit Lead" : "Add New Lead"}
//                 </h2>
//               </div>
//               <div className="p-6">
//                 <LeadForm
//                   lead={selectedLead}
//                   onSuccess={handleLeadSuccess}
//                 />

//                 <button
//                   onClick={() => {
//                     setShowAddForm(false);
//                     setSelectedLead(null);
//                   }}
//                   className="mt-6 text-blue-600 hover:text-blue-800 font-medium flex items-center"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
//                   </svg>
//                   Back to Leads List
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Leads List */}
//           {!showAddForm && !selectedLead && (
//             <>
//               {/* Date Filter Controls */}
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-xl shadow-md dark:shadow-black/25 overflow-hidden mb-8">
//                 <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out border-b border-gray-100 flex justify-between items-center">
//                   <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Filter Leads by Month</h3>
//                   <FaFilter className="text-slate-500 dark:text-gray-400" />
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                       <label htmlFor="month" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Month</label>
//                       <select
//                         id="month"
//                         value={filterMonth}
//                         onChange={handleMonthChange}
//                         className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                       >
//                         {months.map(month => (
//                           <option key={month.value} value={month.value}>
//                             {month.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
//                       <select
//                         id="year"
//                         value={filterYear}
//                         onChange={handleYearChange}
//                         className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                       >
//                         {years.map(year => (
//                           <option key={year} value={year}>
//                             {year}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="flex items-end">
//                       <div className="grid grid-cols-1 gap-2 w-full">
//                         <button
//                           onClick={handleResetToCurrentMonth}
//                           className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2"
//                         >
//                           Show Current Month
//                         </button>
//                         <button
//                           onClick={() => {
//                             setFilterMonth(3);
//                             setFilterYear(2025);
//                             setShowCurrentMonth(false);
//                           }}
//                           className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
//                         >
//                           📁 March 2025 (Imported Leads)
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                     </svg>
//                     <span>Showing {filteredLeads.length} leads for {showCurrentMonth ? 'current month' : `${months.find(m => m.value === parseInt(filterMonth))?.label} ${filterYear}`}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Leads Cards */}
//               <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-xl shadow-md dark:shadow-black/25 overflow-hidden">
//                 <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out border-b border-gray-100">
//                   <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Leads Overview ({filteredLeads.length})</h3>
//                 </div>

//                 {loading ? (
//                   <div className="p-12 flex justify-center">
//                     <LoadingSpinner
//                       size={50}
//                       text="Loading leads..."
//                       particleCount={2}
//                       speed={1.3}
//                       hueRange={[220, 280]}
//                     />
//                   </div>
//                 ) : filteredLeads.length === 0 ? (
//                   <div className="p-12 text-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No leads found</h3>
//                     <p className="text-slate-500 dark:text-gray-400 mb-6">No leads were found for the selected time period</p>
//                     <button
//                       onClick={() => setShowAddForm(true)}
//                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm dark:shadow-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//                       </svg>
//                       Add Your First Lead
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {filteredLeads.map((lead) => (
//                         <div key={lead._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out-shadow shadow-sm">
//                           <div className="flex justify-between items-start mb-4">
//                             <div className="flex-1">
//                               <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{lead.name}</h3>
//                               <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 lead.feedback === 'Converted'
//                                   ? 'bg-green-100 text-green-800'
//                                   : lead.feedback === 'Not Interested'
//                                     ? 'bg-red-100 text-red-800'
//                                     : 'bg-yellow-100 text-yellow-800'
//                               }`}>
//                                 {lead.feedback || 'Pending'}
//                               </span>
//                             </div>
//                             <button
//                               onClick={() => setSelectedLead(lead)}
//                               className="ml-2 inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-full transition-colors duration-200"
//                               title="Edit Lead"
//                             >
//                               <FaEdit className="h-4 w-4" />
//                             </button>
//                           </div>

//                           <div className="space-y-2 text-sm text-gray-600 dark:text-gray-500">
//                             <div className="flex items-center">
//                               <span className="font-medium text-slate-700 dark:text-slate-300 w-16">Course:</span>
//                               <span>{lead.course}</span>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="font-medium text-slate-700 dark:text-slate-300 w-16">Phone:</span>
//                               <span>{lead.phone || lead.countryCode}</span>
//                             </div>
//                             {lead.email && (
//                               <div className="flex items-center">
//                                 <span className="font-medium text-slate-700 dark:text-slate-300 w-16">Email:</span>
//                                 <span className="truncate">{lead.email}</span>
//                               </div>
//                             )}
//                             <div className="flex items-center">
//                               <span className="font-medium text-slate-700 dark:text-slate-300 w-16">Country:</span>
//                               <span>{lead.country || lead.countryCode}</span>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="font-medium text-slate-700 dark:text-slate-300 w-16">Date:</span>
//                               <span>{formatDate(lead.createdAt)}</span>
//                             </div>
//                             {lead.assignedTo && (
//                               <div className="flex items-center">
//                                 <span className="font-medium text-slate-700 dark:text-slate-300 w-16">Assigned:</span>
//                                 <span className="text-blue-600">
//                                   {typeof lead.assignedTo === 'object'
//                                     ? lead.assignedTo.fullName || lead.assignedTo.name || 'Unknown User'
//                                     : lead.assignedTo
//                                   }
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default LeadsPage;

// src/pages/LeadsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeadForm from "../components/Leads/LeadForm";
import Layout from "../components/Layout/Layout";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";
import LoggingService from "../services/loggingService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa"; // ⬅️ Add this to your imports

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
  const [showCurrentMonth, setShowCurrentMonth] = useState(true);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll({
        populate: "createdBy assignedTo leadPerson assignedBy",
      });
      setLeads(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (leads.length === 0) {
      setFilteredLeads([]);
      return;
    }

    let tempFiltered;
    if (showCurrentMonth) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      tempFiltered = leads.filter((lead) => {
        const d = new Date(lead.createdAt);
        return (
          d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
        );
      });
    } else {
      tempFiltered = leads.filter((lead) => {
        const d = new Date(lead.createdAt);
        return (
          d.getMonth() + 1 === filterMonth && d.getFullYear() === filterYear
        );
      });
    }
    
    // Sort by date in descending order (newest first)
    tempFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredLeads(tempFiltered);
  }, [leads, filterMonth, filterYear, showCurrentMonth]);

  const handleLeadSuccess = useCallback(
    async (lead) => {
      if (selectedLead) {
        try {
          await LoggingService.logLeadUpdate(lead._id, lead);
        } catch (err) {
          console.error("Error logging update:", err);
        }
        setSelectedLead(null);
        toast.success("Lead updated successfully!");
      } else {
        try {
          await LoggingService.logLeadCreate(lead);
        } catch (err) {
          console.error("Error logging create:", err);
        }
        setShowAddForm(false);
        toast.success("Lead created successfully!");
      }
      fetchLeads();
    },
    [selectedLead, fetchLeads]
  );

  const handleMonthChange = (e) => {
    setFilterMonth(+e.target.value);
    setShowCurrentMonth(false);
  };
  const handleYearChange = (e) => {
    setFilterYear(+e.target.value);
    setShowCurrentMonth(false);
  };
  const handleResetToCurrentMonth = () => {
    setFilterMonth(new Date().getMonth() + 1);
    setFilterYear(new Date().getFullYear());
    setShowCurrentMonth(true);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();
  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-in-out", once: true });
  }, []);

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setShowAddForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await leadsAPI.remove(id);
      await LoggingService.logLeadDelete(id);
      toast.success("Lead deleted successfully!");
      fetchLeads();
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete lead.");
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "Converted":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "Not Interested":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "Follow Up":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-slate-800 min-h-screen pb-12">
        <div className="bg-hero-light dark:bg-hero-dark p-6 pb-4 md:px-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Leads Management
              </h1>
              <p className="text-blue-100 text-sm md:text-base">
                {filteredLeads.length} leads •{" "}
                {showCurrentMonth
                  ? "Current Month"
                  : `${
                      months.find((m) => m.value === filterMonth)?.label
                    } ${filterYear}`}
              </p>
            </div>
            {(user?.role === "Lead Person" || user?.role === "Manager" || user?.role === "Admin") && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setSelectedLead(null);
                }}
                className="mt-4 md:mt-0 px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg flex items-center font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                <FaPlus className="h-4 w-4 mr-2" /> Add New Lead
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-md border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 md:px-8 py-3 flex flex-wrap gap-3 items-center">
            <select
              value={filterMonth}
              onChange={handleMonthChange}
              className="px-3 py-2 rounded-md border text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={handleYearChange}
              className="px-3 py-2 rounded-md border text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              onClick={handleResetToCurrentMonth}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Current Month
            </button>
          </div>
        </div>

        <div className="px-4 md:px-8 mt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          {loading ? (
            <div className="p-6 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : showAddForm || selectedLead ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden p-6">
              <LeadForm lead={selectedLead} onSuccess={handleLeadSuccess} />
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedLead(null);
                }}
                className="mt-6 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Leads List
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-white dark:bg-slate-900 rounded-lg shadow-md">
              No leads found for this period.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead className="bg-black text-white uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Name
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Course
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Country
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Feedback
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Lead Person
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Assigned To
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {lead.course}
                        </td>

                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${lead.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <FaWhatsapp className="text-green-500 w-4 h-4" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="block font-semibold text-gray-900 dark:text-white">
                              N/A
                            </span>
                          )}

                          {lead.email ? (
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                            >
                              <FaEnvelope className="text-red-500 w-4 h-4" />
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              N/A
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {lead.country || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 dark:border-gray-700 max-w-[200px] overflow-hidden truncate whitespace-normal text-sm text-gray-700 dark:text-gray-300">
                          {lead.feedback || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 whitespace-nowrap truncate max-w-[150px] text-gray-700 dark:text-gray-300">
                          {lead.assignedBy?.fullName ||
                            lead.assignedBy?.name ||
                            lead.leadPerson?.fullName ||
                            lead.leadPerson?.name ||
                            lead.createdBy?.fullName ||
                            lead.createdBy?.name ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 whitespace-nowrap truncate max-w-[150px] text-blue-600 dark:text-blue-400">
                          {lead.assignedTo?.fullName ||
                            lead.assignedTo?.name ||
                            "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditClick(lead)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors p-1"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(lead._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors p-1"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeadsPage;

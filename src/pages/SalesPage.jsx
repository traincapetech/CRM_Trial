// // src/pages/SalesPage.jsx
// import React, { useState, useEffect } from "react";
// import { leadsAPI } from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import Layout from "../components/Layout/Layout";
// import { FaWhatsapp, FaEnvelope, FaPhone, FaFilter, FaCalendarAlt } from "react-icons/fa";

// import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
// const SalesPage = () => {
//   const { user } = useAuth();
//   const [leads, setLeads] = useState([]);
//   const [filteredLeads, setFilteredLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [feedback, setFeedback] = useState({});
//   const [updating, setUpdating] = useState({});
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0); // To trigger refreshes

//   // Date filtering state
//   const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
//   const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
//   const [showCurrentMonth, setShowCurrentMonth] = useState(true); // Flag to show current month by default

//   // Status update state
//   const [statusUpdating, setStatusUpdating] = useState({});

//   // Lead status options
//   const statusOptions = [
//     'New',
//     'Contacted',
//     'Qualified',
//     'Lost',
//     'Converted',
//     'Introduction',
//     'Acknowledgement',
//     'Question',
//     'Future Promise',
//     'Payment',
//     'Analysis'
//   ];

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

//   // Generate year options (5 years back from current year)
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

//   // Fetch leads assigned to the sales person
//   useEffect(() => {
//     fetchLeads();
//   }, [user, refreshTrigger]);

//   // Apply date filters when leads, month, or year changes
//   useEffect(() => {
//     if (leads.length > 0) {
//       filterLeadsByDate();
//     }
//   }, [leads, filterMonth, filterYear, showCurrentMonth]);

//   // Function to filter leads by selected date
//   const filterLeadsByDate = () => {
//     if (showCurrentMonth) {
//       // Show current month data
//       const currentMonth = new Date().getMonth() + 1; // 1-12
//       const currentYear = new Date().getFullYear();

//       const filtered = leads.filter(lead => {
//         const leadDate = new Date(lead.createdAt);
//         return (
//           leadDate.getMonth() + 1 === currentMonth &&
//           leadDate.getFullYear() === currentYear
//         );
//       });

//       setFilteredLeads(filtered);
//     } else {
//       // Show selected month/year data
//       const filtered = leads.filter(lead => {
//         const leadDate = new Date(lead.createdAt);
//         return (
//           leadDate.getMonth() + 1 === filterMonth &&
//           leadDate.getFullYear() === filterYear
//         );
//       });

//       setFilteredLeads(filtered);
//     }
//   };

//   const fetchLeads = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching leads for sales person:", user?.fullName);

//       const response = await leadsAPI.getAssigned();
//       console.log("Leads response:", response.data);

//       if (response.data.success) {
//         setLeads(response.data.data);

//         // Initialize feedback state with current values
//         const feedbackState = {};
//         response.data.data.forEach(lead => {
//           feedbackState[lead._id] = lead.feedback || '';
//         });
//         setFeedback(feedbackState);
//       } else {
//         setError("Failed to load leads");
//       }
//     } catch (err) {
//       console.error("Error fetching leads:", err);
//       setError("Failed to load leads. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle feedback change
//   const handleFeedbackChange = (leadId, value) => {
//     setFeedback(prev => ({
//       ...prev,
//       [leadId]: value
//     }));
//   };

//   // Handle feedback update
//   const updateFeedback = async (leadId) => {
//     if (!leadId || !feedback[leadId]) return;

//     try {
//       setUpdating(prev => ({ ...prev, [leadId]: true }));

//       const response = await leadsAPI.updateFeedback(leadId, feedback[leadId]);

//       if (response.data.success) {
//         // Update the leads state with the updated lead
//         setLeads(leads.map(lead =>
//           lead._id === leadId ? response.data.data : lead
//         ));
//         alert("Feedback updated successfully!");
//       } else {
//         setError("Failed to update feedback");
//       }
//     } catch (err) {
//       console.error("Error updating feedback:", err);
//       setError("Failed to update feedback. Please try again.");
//     } finally {
//       setUpdating(prev => ({ ...prev, [leadId]: false }));
//     }
//   };

//   // Handle status update
//   const updateLeadStatus = async (leadId, newStatus) => {
//     try {
//       setStatusUpdating(prev => ({ ...prev, [leadId]: true }));
//       setError(null); // Clear any previous errors

//       const leadToUpdate = leads.find(lead => lead._id === leadId);
//       if (!leadToUpdate) return;

//       // Only send the status field to update
//       const updatedData = { status: newStatus };

//       console.log("Updating lead status:", leadId, newStatus);
//       const response = await leadsAPI.update(leadId, updatedData);

//       if (response.data.success) {
//         // Update the leads state with the updated lead
//         setLeads(leads.map(lead =>
//           lead._id === leadId ? response.data.data : lead
//         ));

//         // Also update filtered leads to see the change immediately
//         setFilteredLeads(filteredLeads.map(lead =>
//           lead._id === leadId ? response.data.data : lead
//         ));

//         console.log("Lead status updated successfully");
//         // Show success message
//         setFeedback({
//           ...feedback,
//           statusSuccess: `Status updated to "${newStatus}" successfully!`,
//           leadId
//         });

//         // Clear success message after 3 seconds
//         setTimeout(() => {
//           setFeedback(prev => ({
//             ...prev,
//             statusSuccess: null,
//             leadId: null
//           }));
//         }, 3000);

//         // Trigger a refresh of leads
//         setRefreshTrigger(prev => prev + 1);
//       } else {
//         console.error("Failed to update lead status:", response.data);
//         setError("Failed to update lead status. Please try again.");
//       }
//     } catch (err) {
//       console.error("Error updating lead status:", err);
//       if (err.response && err.response.status === 403) {
//         setError("You don't have permission to update this lead status. Contact your manager.");
//       } else {
//         setError("Failed to update lead status. Please try again.");
//       }
//     } finally {
//       setStatusUpdating(prev => ({ ...prev, [leadId]: false }));
//     }
//   };

//   // Handle month change
//   const handleMonthChange = (e) => {
//     setFilterMonth(parseInt(e.target.value));
//     setShowCurrentMonth(false);
//   };

//   // Handle year change
//   const handleYearChange = (e) => {
//     setFilterYear(parseInt(e.target.value));
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

//   // View lead details
//   const viewLeadDetails = (lead) => {
//     setSelectedLead(lead);
//   };

//   // Close lead details modal
//   const closeLeadDetails = () => {
//     setSelectedLead(null);
//   };

//   // Open WhatsApp with the phone number
//   const openWhatsApp = (phone, countryCode) => {
//     if (!phone) return;

//     // Format the phone number for WhatsApp
//     const formattedPhone = `${countryCode || '+91'}${phone.replace(/\D/g, '')}`;
//     const whatsappUrl = `https://wa.me/${formattedPhone.replace(/\+/g, '')}`;

//     // Open WhatsApp in a new tab
//     window.open(whatsappUrl, '_blank');
//   };

//   // Open email client with the email address
//   const openEmail = (email) => {
//     if (!email) return;
//     window.location.href = `mailto:${email}`;
//   };

//   return (
//     <Layout>
//       <div className="container mx-auto p-6">
//         <h2 className="text-3xl font-bold mb-6">My Assigned Leads</h2>

//         {/* Error message with dismissal option */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex justify-between items-center">
//             <div className="flex-1">{error}</div>
//             <button
//               onClick={() => setError(null)}
//               className="text-red-700 hover:text-red-900"
//             >
//               &times;
//             </button>
//           </div>
//         )}

//         {/* Loading indicator */}
//         {loading ? (
//           <div className="text-center py-10">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//             <p className="mt-2 text-gray-600 dark:text-gray-500">Loading your assigned leads...</p>
//           </div>
//         ) : leads.length === 0 ? (
//           <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out rounded-lg">
//             <p className="text-gray-600 dark:text-gray-500">No leads assigned to you yet.</p>
//           </div>
//         ) : (
//           <>
//             {/* Date Filter Controls - Enhanced */}
//             <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl shadow-sm">
//               <h3 className="text-lg font-semibold mb-3 flex items-center">
//                 <FaFilter className="mr-2 text-blue-500" />
//                 Filter Leads by Date
//               </h3>
//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="flex items-center">
//                   <FaCalendarAlt className="text-blue-500 mr-2" />
//                   <div>
//                     <label htmlFor="month" className="block text-sm font-medium text-gray-600 dark:text-gray-500 mb-1">Month</label>
//                     <select
//                       id="month"
//                       value={filterMonth}
//                       onChange={handleMonthChange}
//                       className="border border-slate-300 dark:border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                       disabled={showCurrentMonth}
//                     >
//                       {months.map(month => (
//                         <option key={month.value} value={month.value}>
//                           {month.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="year" className="block text-sm font-medium text-gray-600 dark:text-gray-500 mb-1">Year</label>
//                   <select
//                     id="year"
//                     value={filterYear}
//                     onChange={handleYearChange}
//                     className="border border-slate-300 dark:border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                     disabled={showCurrentMonth}
//                   >
//                     {years.map(year => (
//                       <option key={year} value={year}>
//                         {year}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="flex items-center ml-4">
//                   <input
//                     id="currentMonth"
//                     type="checkbox"
//                     checked={showCurrentMonth}
//                     onChange={() => setShowCurrentMonth(!showCurrentMonth)}
//                     className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 border-slate-300 dark:border-slate-600 rounded"
//                   />
//                   <label htmlFor="currentMonth" className="ml-2 text-sm text-gray-600 dark:text-gray-500">
//                     Show current month only
//                   </label>
//                 </div>

//                 <button
//                   onClick={handleResetToCurrentMonth}
//                   className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 ml-auto flex items-center"
//                 >
//                   <FaCalendarAlt className="mr-2" />
//                   Reset to Current Month
//                 </button>
//               </div>

//               {/* Display filter result summary */}
//               <div className="mt-3 text-sm text-gray-600 dark:text-gray-500">
//                 Showing {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
//                 {showCurrentMonth
//                   ? ' for the current month'
//                   : ` for ${months.find(m => m.value === filterMonth)?.label} ${filterYear}`
//                 }
//               </div>
//             </div>

//             {/* Leads Table */}
//             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden shadow-sm">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//                   <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Feedback</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
//                     {filteredLeads.map(lead => (
//                       <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.name}</div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-col space-y-1">
//                             {lead.phone && (
//                               <div className="flex items-center">
//                                 <button
//                                   onClick={() => openWhatsApp(lead.phone, lead.countryCode)}
//                                   className="text-sm text-slate-900 dark:text-slate-100 flex items-center hover:text-green-600"
//                                   title="Open in WhatsApp"
//                                 >
//                                   <FaWhatsapp className="mr-1 text-green-500" />
//                                   {lead.countryCode || '+91'} {lead.phone}
//                                 </button>
//                               </div>
//                             )}
//                             {lead.email && (
//                               <div className="flex items-center">
//                                 <button
//                                   onClick={() => openEmail(lead.email)}
//                                   className="text-sm text-slate-500 dark:text-gray-400 flex items-center hover:text-blue-600"
//                                   title="Send email"
//                                 >
//                                   <FaEnvelope className="mr-1 text-blue-500" />
//                                   {lead.email}
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-slate-900 dark:text-slate-100">{lead.course}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="relative">
//                             <select
//                               value={lead.status}
//                               onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
//                               disabled={statusUpdating[lead._id]}
//                               className={`text-sm px-2 py-1 rounded ${
//                                 lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
//                                 lead.status === 'Contacted' ? 'bg-teal-100 text-teal-800' :
//                                 lead.status === 'Qualified' ? 'bg-indigo-100 text-indigo-800' :
//                                 lead.status === 'Lost' ? 'bg-red-100 text-red-800' :
//                                 lead.status === 'Converted' ? 'bg-green-100 text-green-800' :
//                                 lead.status === 'Introduction' ? 'bg-purple-100 text-purple-800' :
//                                 lead.status === 'Acknowledgement' ? 'bg-yellow-100 text-yellow-800' :
//                                 lead.status === 'Question' ? 'bg-indigo-100 text-indigo-800' :
//                                 lead.status === 'Future Promise' ? 'bg-cyan-100 text-cyan-800' :
//                                 lead.status === 'Payment' ? 'bg-green-100 text-green-800' :
//                                 lead.status === 'Analysis' ? 'bg-red-100 text-red-800' :
//                                 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
//                               } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 appearance-none cursor-pointer w-full pr-8`}
//                             >
//                               {statusOptions.map(status => (
//                                 <option key={status} value={status}>{status}</option>
//                               ))}
//                             </select>
//                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
//                               <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//                                 <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
//                               </svg>
//                             </div>
//                             {statusUpdating[lead._id] && (
//                               <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
//                                 <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
//                               </div>
//                             )}
//                             {feedback.statusSuccess && feedback.leadId === lead._id && (
//                               <div className="absolute top-full left-0 mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-normal w-48 z-10">
//                                 {feedback.statusSuccess}
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-slate-500 dark:text-gray-400">{formatDate(lead.createdAt)}</div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="relative">
//                             <textarea
//                               value={feedback[lead._id] || ''}
//                               onChange={(e) => handleFeedbackChange(lead._id, e.target.value)}
//                               placeholder="Add feedback..."
//                               className="text-sm w-full h-20 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                             />
//                             <button
//                               onClick={() => updateFeedback(lead._id)}
//                               disabled={updating[lead._id] || !feedback[lead._id]}
//                               className={`mt-1 px-3 py-1 text-xs rounded ${
//                                 updating[lead._id] || !feedback[lead._id]
//                                   ? 'bg-gray-300 text-gray-500 dark:text-gray-400 dark:text-gray-400 cursor-not-allowed'
//                                   : 'bg-blue-600 text-white hover:bg-blue-700'
//                               }`}
//                             >
//                               {updating[lead._id] ? 'Saving...' : 'Save Feedback'}
//                             </button>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <button
//                             onClick={() => viewLeadDetails(lead)}
//                             className="text-blue-600 hover:text-blue-900"
//                           >
//                             View Details
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Lead Details Modal */}
//         {selectedLead && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-sm dark:shadow-black/25">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Lead Details</h3>
//                 <button
//                   onClick={closeLeadDetails}
//                   className="text-gray-400 dark:text-slate-400 hover:text-slate-500"
//                 >
//                   &times;
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Name</p>
//                   <p className="text-base">{selectedLead.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Email</p>
//                   <p className="text-base">
//                     <button
//                       onClick={() => openEmail(selectedLead.email)}
//                       className="text-blue-600 hover:text-blue-800 flex items-center"
//                     >
//                       <FaEnvelope className="mr-1" /> {selectedLead.email}
//                     </button>
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Phone</p>
//                   <p className="text-base">
//                     <button
//                       onClick={() => openWhatsApp(selectedLead.phone, selectedLead.countryCode)}
//                       className="text-green-600 hover:text-green-800 flex items-center"
//                     >
//                       <FaWhatsapp className="mr-1" /> {selectedLead.countryCode || '+91'} {selectedLead.phone}
//                     </button>
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Course</p>
//                   <p className="text-base">{selectedLead.course}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Status</p>
//                   <div className="relative">
//                     <select
//                       value={selectedLead.status}
//                       onChange={(e) => {
//                         updateLeadStatus(selectedLead._id, e.target.value);
//                         setSelectedLead({...selectedLead, status: e.target.value});
//                       }}
//                       className={`px-2 py-1 rounded ${
//                         selectedLead.status === 'New' ? 'bg-blue-100 text-blue-800' :
//                         selectedLead.status === 'Contacted' ? 'bg-teal-100 text-teal-800' :
//                         selectedLead.status === 'Qualified' ? 'bg-indigo-100 text-indigo-800' :
//                         selectedLead.status === 'Lost' ? 'bg-red-100 text-red-800' :
//                         selectedLead.status === 'Converted' ? 'bg-green-100 text-green-800' :
//                         selectedLead.status === 'Introduction' ? 'bg-purple-100 text-purple-800' :
//                         selectedLead.status === 'Acknowledgement' ? 'bg-yellow-100 text-yellow-800' :
//                         selectedLead.status === 'Question' ? 'bg-indigo-100 text-indigo-800' :
//                         selectedLead.status === 'Future Promise' ? 'bg-cyan-100 text-cyan-800' :
//                         selectedLead.status === 'Payment' ? 'bg-green-100 text-green-800' :
//                         selectedLead.status === 'Analysis' ? 'bg-red-100 text-red-800' :
//                         'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
//                       } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 appearance-none cursor-pointer pr-8 relative`}
//                     >
//                       {statusOptions.map(status => (
//                         <option key={status} value={status}>{status}</option>
//                       ))}
//                     </select>
//                     <div className="pointer-events-none absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center px-2 text-slate-700 dark:text-slate-300">
//                       <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//                         <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
//                       </svg>
//                     </div>
//                     {statusUpdating[selectedLead._id] && (
//                       <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
//                         <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
//                       </div>
//                     )}
//                     {feedback.statusSuccess && feedback.leadId === selectedLead._id && (
//                       <div className="absolute top-full left-0 mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-normal w-48 z-10">
//                         {feedback.statusSuccess}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Created At</p>
//                   <p className="text-base">{formatDate(selectedLead.createdAt)}</p>
//                 </div>

//                 {/* Additional client data */}
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Country</p>
//                   <p className="text-base">{selectedLead.country || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Company</p>
//                   <p className="text-base">{selectedLead.company || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Client</p>
//                   <p className="text-base">{selectedLead.client || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Pseudo ID</p>
//                   <p className="text-base">{selectedLead.pseudoId || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Source</p>
//                   <p className="text-base">{selectedLead.source || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-500 dark:text-gray-400">LinkedIn</p>
//                   <p className="text-base">
//                     {selectedLead.sourceLink ? (
//                       <a
//                         href={selectedLead.sourceLink.startsWith('http') ? selectedLead.sourceLink : `https://${selectedLead.sourceLink}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:text-blue-800 underline"
//                       >
//                         {selectedLead.sourceLink}
//                       </a>
//                     ) : 'N/A'}
//                   </p>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Remarks</p>
//                 <p className="text-base p-2 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out rounded min-h-[40px]">
//                   {selectedLead.remarks || 'No remarks available'}
//                 </p>
//               </div>

//               <div className="mb-4">
//                 <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Feedback</p>
//                 <textarea
//                   value={feedback[selectedLead._id] || ''}
//                   onChange={(e) => handleFeedbackChange(selectedLead._id, e.target.value)}
//                   placeholder="Add feedback..."
//                   className="w-full h-24 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//                 />
//                 <button
//                   onClick={() => updateFeedback(selectedLead._id)}
//                   disabled={updating[selectedLead._id] || !feedback[selectedLead._id]}
//                   className={`mt-2 px-4 py-2 rounded ${
//                     updating[selectedLead._id] || !feedback[selectedLead._id]
//                       ? 'bg-gray-300 text-gray-500 dark:text-gray-400 dark:text-gray-400 cursor-not-allowed'
//                       : 'bg-blue-600 text-white hover:bg-blue-700'
//                   }`}
//                 >
//                   {updating[selectedLead._id] ? 'Saving...' : 'Save Feedback'}
//                 </button>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   onClick={closeLeadDetails}
//                   className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default SalesPage;

// src/pages/SalesPage.jsx
import React, { useState, useEffect } from "react";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  professionalClasses,
  transitions,
  shadows,
} from "../utils/professionalDarkMode";
const SalesPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [updating, setUpdating] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To trigger refreshes
  // Add a new state to track unsaved changes
  const [dirtyFeedback, setDirtyFeedback] = useState({});

  // Date filtering state
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [showCurrentMonth, setShowCurrentMonth] = useState(true); // Flag to show current month by default

  // Status update state
  const [statusUpdating, setStatusUpdating] = useState({});

  // Lead status options
  const statusOptions = [
    "New",
    "Contacted",
    "Qualified",
    "Lost",
    "Converted",
    "Introduction",
    "Acknowledgement",
    "Question",
    "Future Promise",
    "Payment",
    "Analysis",
  ];

  // Generate month options
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

  // Generate year options (5 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Fetch leads assigned to the sales person
  useEffect(() => {
    fetchLeads();
  }, [user, refreshTrigger]);

  // Apply date filters when leads, month, or year changes
  useEffect(() => {
    if (leads.length > 0) {
      filterLeadsByDate();
    }
  }, [leads, filterMonth, filterYear, showCurrentMonth]);

  // Function to filter leads by selected date
  const filterLeadsByDate = () => {
    if (showCurrentMonth) {
      // Show current month data
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();

      const filtered = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return (
          leadDate.getMonth() + 1 === currentMonth &&
          leadDate.getFullYear() === currentYear
        );
      });

      setFilteredLeads(filtered);
    } else {
      // Show selected month/year data
      const filtered = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return (
          leadDate.getMonth() + 1 === filterMonth &&
          leadDate.getFullYear() === filterYear
        );
      });

      setFilteredLeads(filtered);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log("Fetching leads for sales person:", user?.fullName);

      const response = await leadsAPI.getAssigned();
      console.log("Leads response:", response.data);

      if (response.data.success) {
        setLeads(response.data.data);

        // Initialize feedback state with current values
        const feedbackState = {};
        response.data.data.forEach((lead) => {
          feedbackState[lead._id] = lead.feedback || "";
        });
        setFeedback(feedbackState);
      } else {
        setError("Failed to load leads");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (leadId, value) => {
    setFeedback((prev) => ({
      ...prev,
      [leadId]: value,
    }));

    // Mark feedback as dirty (changed)
    setDirtyFeedback((prev) => ({
      ...prev,
      [leadId]: true,
    }));
  };

  // Handle feedback update
  const updateFeedback = async (leadId) => {
    if (!leadId || !feedback[leadId]) return;

    try {
      setUpdating((prev) => ({ ...prev, [leadId]: true }));

      const response = await leadsAPI.updateFeedback(leadId, feedback[leadId]);

      if (response.data.success) {
        setLeads(
          leads.map((lead) => (lead._id === leadId ? response.data.data : lead))
        );
        alert("Feedback updated successfully!");

        // Reset dirty state after saving
        setDirtyFeedback((prev) => ({
          ...prev,
          [leadId]: false,
        }));
      } else {
        setError("Failed to update feedback");
      }
    } catch (err) {
      console.error("Error updating feedback:", err);
      setError("Failed to update feedback. Please try again.");
    } finally {
      setUpdating((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  // Handle status update
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      setStatusUpdating((prev) => ({ ...prev, [leadId]: true }));
      setError(null); // Clear any previous errors

      const leadToUpdate = leads.find((lead) => lead._id === leadId);
      if (!leadToUpdate) return;

      // Only send the status field to update
      const updatedData = { status: newStatus };

      console.log("Updating lead status:", leadId, newStatus);
      const response = await leadsAPI.update(leadId, updatedData);

      if (response.data.success) {
        // Update the leads state with the updated lead
        setLeads(
          leads.map((lead) => (lead._id === leadId ? response.data.data : lead))
        );

        // Also update filtered leads to see the change immediately
        setFilteredLeads(
          filteredLeads.map((lead) =>
            lead._id === leadId ? response.data.data : lead
          )
        );

        console.log("Lead status updated successfully");
        // Show success message
        setFeedback({
          ...feedback,
          statusSuccess: `Status updated to "${newStatus}" successfully!`,
          leadId,
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setFeedback((prev) => ({
            ...prev,
            statusSuccess: null,
            leadId: null,
          }));
        }, 3000);

        // Trigger a refresh of leads
        setRefreshTrigger((prev) => prev + 1);
      } else {
        console.error("Failed to update lead status:", response.data);
        setError("Failed to update lead status. Please try again.");
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
      if (err.response && err.response.status === 403) {
        setError(
          "You don't have permission to update this lead status. Contact your manager."
        );
      } else {
        setError("Failed to update lead status. Please try again.");
      }
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setFilterMonth(parseInt(e.target.value));
    setShowCurrentMonth(false);
  };

  // Handle year change
  const handleYearChange = (e) => {
    setFilterYear(parseInt(e.target.value));
    setShowCurrentMonth(false);
  };

  // Handle reset to current month
  const handleResetToCurrentMonth = () => {
    setFilterMonth(new Date().getMonth() + 1);
    setFilterYear(new Date().getFullYear());
    setShowCurrentMonth(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // View lead details
  const viewLeadDetails = (lead) => {
    setSelectedLead(lead);
  };

  // Close lead details modal
  const closeLeadDetails = () => {
    setSelectedLead(null);
  };

  // Open WhatsApp with the phone number
  const openWhatsApp = (phone, countryCode) => {
    if (!phone) return;

    // Format the phone number for WhatsApp
    const formattedPhone = `${countryCode || "+91"}${phone.replace(/\D/g, "")}`;
    const whatsappUrl = `https://wa.me/${formattedPhone.replace(/\+/g, "")}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");
  };

  // Open email client with the email address
  const openEmail = (email) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-slate-800 min-h-screen pb-12">
        <div className="bg-hero-light dark:bg-hero-dark p-6 pb-4 md:px-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                My Assigned Leads
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
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-md border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 md:px-8 py-3 flex flex-wrap gap-3 items-center">
            <select
              value={filterMonth}
              onChange={handleMonthChange}
              className="px-3 py-2 rounded-md border text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              disabled={showCurrentMonth}
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
              disabled={showCurrentMonth}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showCurrentMonth}
                onChange={() => setShowCurrentMonth(!showCurrentMonth)}
                className="mr-2"
              />
              Current Month
            </label>
            <button
              onClick={handleResetToCurrentMonth}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error message with dismissal option */}
        {error && (
          <div className="mx-4 md:mx-8 mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex justify-between items-center">
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              &times;
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-500">
              Loading your assigned leads...
            </p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out rounded-lg mx-4 md:mx-8 mt-4">
            <p className="text-gray-600 dark:text-gray-500">
              No leads assigned to you yet.
            </p>
          </div>
        ) : (
          <>
            {/* Leads Table */}
            <div className="px-4 md:px-8 mt-6">
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
                          Lead Person
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                          Course
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                          Feedback
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
                            {lead.assignedBy?.fullName ||
                              lead.assignedByName ||
                              lead.createdBy?.fullName ||
                              "N/A"}
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
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                            <div className="relative">
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  updateLeadStatus(lead._id, e.target.value)
                                }
                                disabled={statusUpdating[lead._id]}
                                className={`text-sm px-2 py-1 rounded ${
                                  lead.status === "New"
                                    ? "bg-blue-100 text-blue-800"
                                    : lead.status === "Contacted"
                                    ? "bg-teal-100 text-teal-800"
                                    : lead.status === "Qualified"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : lead.status === "Lost"
                                    ? "bg-red-100 text-red-800"
                                    : lead.status === "Converted"
                                    ? "bg-green-100 text-green-800"
                                    : lead.status === "Introduction"
                                    ? "bg-purple-100 text-purple-800"
                                    : lead.status === "Acknowledgement"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : lead.status === "Question"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : lead.status === "Future Promise"
                                    ? "bg-cyan-100 text-cyan-800"
                                    : lead.status === "Payment"
                                    ? "bg-green-100 text-green-800"
                                    : lead.status === "Analysis"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                                } border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 appearance-none cursor-pointer w-full pr-8`}
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              {statusUpdating[lead._id] && (
                                <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                </div>
                              )}
                              {feedback.statusSuccess &&
                                feedback.leadId === lead._id && (
                                  <div className="absolute top-full left-0 mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-normal w-48 z-10">
                                    {feedback.statusSuccess}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                            <div className="relative">
                              <textarea
                                value={feedback[lead._id] || ""}
                                onChange={(e) =>
                                  handleFeedbackChange(lead._id, e.target.value)
                                }
                                placeholder="Add feedback..."
                                className="text-sm w-full h-16 p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                              />

                              {dirtyFeedback[lead._id] && (
                                <button
                                  onClick={() => updateFeedback(lead._id)}
                                  disabled={updating[lead._id]}
                                  className={`mt-1 px-3 py-1 text-xs rounded ${
                                    updating[lead._id]
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                                >
                                  {updating[lead._id] ? "Saving..." : "Save"}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                            <button
                              onClick={() => viewLeadDetails(lead)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg dark:shadow-black/40">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Lead Details
                </h3>
                <button
                  onClick={closeLeadDetails}
                  className="text-gray-400 dark:text-slate-400 hover:text-slate-500 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Name */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Name:
                  </span>
                  <span className="font-semibold">{selectedLead.name}</span>
                </div>

                {/* Email */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Email:
                  </span>
                  <button
                    onClick={() => openEmail(selectedLead.email)}
                    className="text-blue-600 hover:text-blue-800 flex items-center font-semibold"
                  >
                    <FaEnvelope className="mr-1" /> {selectedLead.email}
                  </button>
                </div>

                {/* Phone */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Phone:
                  </span>
                  <button
                    onClick={() =>
                      openWhatsApp(selectedLead.phone, selectedLead.countryCode)
                    }
                    className="text-green-600 hover:text-green-800 flex items-center font-semibold"
                  >
                    <FaWhatsapp className="mr-1" />{" "}
                    {selectedLead.countryCode || "+91"} {selectedLead.phone}
                  </button>
                </div>

                {/* Course */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Course:
                  </span>
                  <span className="font-semibold">{selectedLead.course}</span>
                </div>

                {/* Lead Person */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Lead Person:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.assignedBy?.fullName ||
                      selectedLead.assignedByName ||
                      selectedLead.createdBy?.fullName ||
                      "N/A"}
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800 relative">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Status:
                  </span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => {
                      updateLeadStatus(selectedLead._id, e.target.value);
                      setSelectedLead({
                        ...selectedLead,
                        status: e.target.value,
                      });
                    }}
                    className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                      selectedLead.status === "New"
                        ? "bg-blue-100 text-blue-800"
                        : selectedLead.status === "Contacted"
                        ? "bg-teal-100 text-teal-800"
                        : selectedLead.status === "Qualified"
                        ? "bg-indigo-100 text-indigo-800"
                        : selectedLead.status === "Lost"
                        ? "bg-red-100 text-red-800"
                        : selectedLead.status === "Converted"
                        ? "bg-green-100 text-green-800"
                        : selectedLead.status === "Introduction"
                        ? "bg-purple-100 text-purple-800"
                        : selectedLead.status === "Acknowledgement"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedLead.status === "Question"
                        ? "bg-indigo-100 text-indigo-800"
                        : selectedLead.status === "Future Promise"
                        ? "bg-cyan-100 text-cyan-800"
                        : selectedLead.status === "Payment"
                        ? "bg-green-100 text-green-800"
                        : selectedLead.status === "Analysis"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {statusUpdating[selectedLead._id] && (
                    <div className="absolute right-3 animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  )}

                  {feedback.statusSuccess &&
                    feedback.leadId === selectedLead._id && (
                      <div className="absolute top-full right-0 mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {feedback.statusSuccess}
                      </div>
                    )}
                </div>

                {/* Created At */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Created At:
                  </span>
                  <span className="font-semibold">
                    {formatDate(selectedLead.createdAt)}
                  </span>
                </div>

                {/* Country */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Country:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.country || "N/A"}
                  </span>
                </div>

                {/* Company */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Company:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.company || "N/A"}
                  </span>
                </div>

                {/* Client */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Client:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.client || "N/A"}
                  </span>
                </div>

                {/* Pseudo ID */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Pseudo ID:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.pseudoId || "N/A"}
                  </span>
                </div>

                {/* Source */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Source:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.source || "N/A"}
                  </span>
                </div>

                {/* LinkedIn */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    LinkedIn:
                  </span>
                  {selectedLead.sourceLink ? (
                    <a
                      href={
                        selectedLead.sourceLink.startsWith("http")
                          ? selectedLead.sourceLink
                          : `https://${selectedLead.sourceLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      {selectedLead.sourceLink}
                    </a>
                  ) : (
                    <span className="font-semibold">N/A</span>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                  Remarks
                </p>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-base">
                  {selectedLead.remarks || "No remarks available"}
                </div>
              </div>

              {/* Feedback */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                  Feedback
                </p>
                <textarea
                  value={feedback[selectedLead._id] || ""}
                  onChange={(e) =>
                    handleFeedbackChange(selectedLead._id, e.target.value)
                  }
                  placeholder="Add feedback..."
                  rows={3} // keeps it small, not oversized
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none text-sm"
                ></textarea>

                <button
                  onClick={() => updateFeedback(selectedLead._id)}
                  disabled={
                    updating[selectedLead._id] || !feedback[selectedLead._id]
                  }
                  className={`mt-3 px-4 py-2 rounded-md ${
                    updating[selectedLead._id] || !feedback[selectedLead._id]
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {updating[selectedLead._id] ? "Saving..." : "Save Feedback"}
                </button>
              </div>

              {/* Footer */}
              <div className="flex justify-end">
                <button
                  onClick={closeLeadDetails}
                  className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SalesPage;

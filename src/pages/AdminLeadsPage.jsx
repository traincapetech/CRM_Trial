// import React, { useState, useEffect } from "react";
// import Layout from "../components/Layout/Layout";
// import { leadsAPI, authAPI } from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import { Link } from "react-router-dom";

// import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
// const AdminLeadsPage = () => {
//   const { user } = useAuth();
//   const [leads, setLeads] = useState([]);
//   const [filteredLeads, setFilteredLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter state
//   const [filters, setFilters] = useState({
//     search: "",
//     status: "",
//     country: "",
//     course: "",
//     source: "",
//     dateFrom: "",
//     dateTo: "",
//     assignedTo: "",
//     leadPerson: ""
//   });

//   // Options for filters
//   const [filterOptions, setFilterOptions] = useState({
//     countries: [],
//     courses: [],
//     sources: [],
//     salesPersons: [],
//     leadPersons: []
//   });

//   // Lead statuses
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

//   useEffect(() => {
//     fetchLeads();
//     fetchUserOptions();
//   }, []);

//   useEffect(() => {
//     if (leads.length > 0) {
//       applyFilters();
//       extractFilterOptions();
//     }
//   }, [leads, filters]);

//   const fetchLeads = async () => {
//     try {
//       setLoading(true);
//       const response = await leadsAPI.getAll();

//       if (response.data.success) {
//         setLeads(response.data.data);
//         setFilteredLeads(response.data.data);
//         setError(null);
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

//   const fetchUserOptions = async () => {
//     try {
//       const salesPersonsResponse = await authAPI.getUsers("Sales Person");
//       const leadPersonsResponse = await authAPI.getUsers("Lead Person");

//       setFilterOptions(prev => ({
//         ...prev,
//         salesPersons: salesPersonsResponse.data.data || [],
//         leadPersons: leadPersonsResponse.data.data || []
//       }));
//     } catch (err) {
//       console.error("Error fetching user options:", err);
//     }
//   };

//   const extractFilterOptions = () => {
//     // Extract unique values for filter options
//     const countries = [...new Set(leads.map(lead => lead.country).filter(Boolean))];
//     const courses = [...new Set(leads.map(lead => lead.course).filter(Boolean))];
//     const sources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];

//     setFilterOptions(prev => ({
//       ...prev,
//       countries,
//       courses,
//       sources
//     }));
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const resetFilters = () => {
//     setFilters({
//       search: "",
//       status: "",
//       country: "",
//       course: "",
//       source: "",
//       dateFrom: "",
//       dateTo: "",
//       assignedTo: "",
//       leadPerson: ""
//     });
//   };

//   const applyFilters = () => {
//     let filtered = [...leads];

//     // Text search (name, email, phone, pseudoId)
//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       filtered = filtered.filter(lead =>
//         (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
//         (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
//         (lead.phone && lead.phone.includes(searchTerm)) ||
//         (lead.pseudoId && lead.pseudoId.toLowerCase().includes(searchTerm))
//       );
//     }

//     // Status filter
//     if (filters.status) {
//       filtered = filtered.filter(lead => lead.status === filters.status);
//     }

//     // Country filter
//     if (filters.country) {
//       filtered = filtered.filter(lead => lead.country === filters.country);
//     }

//     // Course filter
//     if (filters.course) {
//       filtered = filtered.filter(lead => lead.course === filters.course);
//     }

//     // Source filter
//     if (filters.source) {
//       filtered = filtered.filter(lead => lead.source === filters.source);
//     }

//     // Date range filter
//     if (filters.dateFrom) {
//       const fromDate = new Date(filters.dateFrom);
//       filtered = filtered.filter(lead => new Date(lead.createdAt) >= fromDate);
//     }

//     if (filters.dateTo) {
//       const toDate = new Date(filters.dateTo);
//       toDate.setHours(23, 59, 59, 999); // End of the day
//       filtered = filtered.filter(lead => new Date(lead.createdAt) <= toDate);
//     }

//     // Assigned To filter
//     if (filters.assignedTo) {
//       filtered = filtered.filter(lead =>
//         lead.assignedTo && lead.assignedTo._id === filters.assignedTo
//       );
//     }

//     // Lead Person filter
//     if (filters.leadPerson) {
//       filtered = filtered.filter(lead =>
//         lead.leadPerson && lead.leadPerson._id === filters.leadPerson
//       );
//     }

//     setFilteredLeads(filtered);
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <Layout>
//       <div className="container mx-auto p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">Admin Leads Management</h1>
//           <Link
//             to="/leads"
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md transition"
//           >
//             Standard Leads View
//           </Link>
//         </div>

//         {error && (
//           <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {/* Advanced Filters */}
//         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-6 shadow-sm">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-medium">Advanced Filters</h2>
//             <button
//               onClick={resetFilters}
//               className="text-sm text-blue-600 hover:underline"
//             >
//               Reset Filters
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {/* Search Field */}
//             <div>
//               <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Search
//               </label>
//               <input
//                 type="text"
//                 id="search"
//                 name="search"
//                 placeholder="Search name, email, phone..."
//                 value={filters.search}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Status
//               </label>
//               <select
//                 id="status"
//                 name="status"
//                 value={filters.status}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               >
//                 <option value="">All Statuses</option>
//                 {statusOptions.map(status => (
//                   <option key={status} value={status}>{status}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Country Filter */}
//             <div>
//               <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Country
//               </label>
//               <select
//                 id="country"
//                 name="country"
//                 value={filters.country}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               >
//                 <option value="">All Countries</option>
//                 {filterOptions.countries.map(country => (
//                   <option key={country} value={country}>{country}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Course Filter */}
//             <div>
//               <label htmlFor="course" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Course
//               </label>
//               <select
//                 id="course"
//                 name="course"
//                 value={filters.course}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               >
//                 <option value="">All Courses</option>
//                 {filterOptions.courses.map(course => (
//                   <option key={course} value={course}>{course}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Source Filter */}
//             <div>
//               <label htmlFor="source" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Source
//               </label>
//               <select
//                 id="source"
//                 name="source"
//                 value={filters.source}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               >
//                 <option value="">All Sources</option>
//                 {filterOptions.sources.map(source => (
//                   <option key={source} value={source}>{source}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Date Range - From */}
//             <div>
//               <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Date From
//               </label>
//               <input
//                 type="date"
//                 id="dateFrom"
//                 name="dateFrom"
//                 value={filters.dateFrom}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               />
//             </div>

//             {/* Date Range - To */}
//             <div>
//               <label htmlFor="dateTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Date To
//               </label>
//               <input
//                 type="date"
//                 id="dateTo"
//                 name="dateTo"
//                 value={filters.dateTo}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               />
//             </div>

//             {/* Assigned To Filter */}
//             <div>
//               <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Assigned To
//               </label>
//               <select
//                 id="assignedTo"
//                 name="assignedTo"
//                 value={filters.assignedTo}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               >
//                 <option value="">All Sales Persons</option>
//                 {filterOptions.salesPersons.map(salesPerson => (
//                   <option key={salesPerson._id} value={salesPerson._id}>
//                     {salesPerson.fullName}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Lead Person Filter */}
//             <div>
//               <label htmlFor="leadPerson" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
//                 Lead Person
//               </label>
//               <select
//                 id="leadPerson"
//                 name="leadPerson"
//                 value={filters.leadPerson}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
//               >
//                 <option value="">All Lead Persons</option>
//                 {filterOptions.leadPersons.map(leadPerson => (
//                   <option key={leadPerson._id} value={leadPerson._id}>
//                     {leadPerson.fullName}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Leads Table */}
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden shadow-sm">
//             <div className="p-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
//               <h3 className="text-lg font-medium">{filteredLeads.length} Leads Found</h3>
//               <div className="text-sm text-slate-500 dark:text-gray-400">
//                 Showing filtered results from a total of {leads.length} leads
//               </div>
//             </div>

//             {filteredLeads.length === 0 ? (
//               <div className="p-6 text-center text-slate-500 dark:text-gray-400">
//                 No leads found matching your filters. Try adjusting your criteria.
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//                   <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
//                     <tr>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         #
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Name
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Contact
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Course
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Country
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Assigned To
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Lead By
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
//                     {filteredLeads.map((lead, index) => (
//                       <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
//                           {index + 1}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
//                             {lead.name}
//                             {lead.isRepeatCustomer && (
//                               <span
//                                 className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
//                                 title={`Repeat customer! Previous courses: ${lead.previousCourses?.join(', ') || 'None'}`}
//                               >
//                                 Repeat
//                               </span>
//                             )}
//                           </div>
//                           <div className="text-sm text-slate-500 dark:text-gray-400">{lead.pseudoId}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-slate-900 dark:text-slate-100">{lead.email}</div>
//                           <div className="text-sm text-slate-500 dark:text-gray-400">
//                             {lead.countryCode} {lead.phone}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-slate-900 dark:text-slate-100">{lead.course}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
//                             ${lead.status === 'Introduction' ? 'bg-blue-100 text-blue-800' :
//                             lead.status === 'Acknowledgement' ? 'bg-yellow-100 text-yellow-800' :
//                             lead.status === 'Question' ? 'bg-purple-100 text-purple-800' :
//                             lead.status === 'Future Promise' ? 'bg-red-100 text-red-800' :
//                             lead.status === 'Payment' ? 'bg-green-100 text-green-800' :
//                             lead.status === 'Analysis' ? 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200' :
//                             'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}
//                           `}>
//                             {lead.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
//                           {lead.country}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
//                           {lead.assignedTo ? lead.assignedTo.fullName : 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
//                           {lead.leadPerson ? lead.leadPerson.fullName : 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
//                           {formatDate(lead.createdAt)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
//                           <Link
//                             to={`/leads#${lead._id}`}
//                             className="text-blue-600 hover:text-blue-900 mr-3"
//                           >
//                             View
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default AdminLeadsPage;
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { leadsAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaEnvelope, FaWhatsapp, FaTimes } from "react-icons/fa";

const AdminLeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Collapsible filters
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    country: "",
    course: "",
    source: "",
    dateFrom: "",
    dateTo: "",
    assignedTo: "",
    leadPerson: "",
  });

  // Options for filters
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    courses: [],
    sources: [],
    salesPersons: [],
    leadPersons: [],
  });

  // Lead statuses
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

  useEffect(() => {
    fetchLeads();
    fetchUserOptions();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      applyFilters();
      extractFilterOptions();
    }
  }, [leads, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Try different API call approaches
      let response;
      try {
        // First try with populate
        response = await leadsAPI.getAll({
          populate: "createdBy assignedTo leadPerson assignedBy",
        });
        console.log('API response with populate:', response.data);
      } catch (err) {
        console.log('Populate failed, trying without:', err);
        // Fallback without populate
        response = await leadsAPI.getAll();
        console.log('API response without populate:', response.data);
      }

      if (response.data.success) {
        // Debug: Log the first lead to see the data structure
        if (response.data.data && response.data.data.length > 0) {
          console.log('First lead data structure:', response.data.data[0]);
          console.log('Lead Person data:', response.data.data[0].leadPerson);
          console.log('Assigned To data:', response.data.data[0].assignedTo);
          console.log('Assigned By data:', response.data.data[0].assignedBy);
        }
        
        // Sort by date in descending order (newest first)
        const sortedLeads = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeads(sortedLeads);
        setFilteredLeads(sortedLeads);
        setError(null);
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

  const fetchUserOptions = async () => {
    try {
      const salesPersonsResponse = await authAPI.getUsers("Sales Person");
      const leadPersonsResponse = await authAPI.getUsers("Lead Person");

      setFilterOptions((prev) => ({
        ...prev,
        salesPersons: salesPersonsResponse.data.data || [],
        leadPersons: leadPersonsResponse.data.data || [],
      }));
    } catch (err) {
      console.error("Error fetching user options:", err);
    }
  };

  const extractFilterOptions = () => {
    const countries = [
      ...new Set(leads.map((lead) => lead.country).filter(Boolean)),
    ];
    const courses = [
      ...new Set(leads.map((lead) => lead.course).filter(Boolean)),
    ];
    const sources = [
      ...new Set(leads.map((lead) => lead.source).filter(Boolean)),
    ];

    setFilterOptions((prev) => ({
      ...prev,
      countries,
      courses,
      sources,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      country: "",
      course: "",
      source: "",
      dateFrom: "",
      dateTo: "",
      assignedTo: "",
      leadPerson: "",
    });
  };

  const applyFilters = () => {
    let filtered = [...leads];
    
    console.log('Applying filters:', filters);
    console.log('Total leads before filtering:', filtered.length);

    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
          (lead.phone && lead.phone.includes(searchTerm)) ||
          (lead.pseudoId && lead.pseudoId.toLowerCase().includes(searchTerm))
      );
      console.log('After search filter:', filtered.length);
    }

    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }
    if (filters.country) {
      filtered = filtered.filter((lead) => lead.country === filters.country);
    }
    if (filters.course) {
      filtered = filtered.filter((lead) => lead.course === filters.course);
    }
    if (filters.source) {
      filtered = filtered.filter((lead) => lead.source === filters.source);
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt) >= fromDate
      );
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((lead) => new Date(lead.createdAt) <= toDate);
    }
    if (filters.assignedTo) {
      console.log('Filtering by assignedTo:', filters.assignedTo);
      filtered = filtered.filter((lead) => {
        // Check multiple possible data structures for assignedTo
        const assignedToId = lead.assignedTo?._id || 
                           lead.assignedTo?.id || 
                           lead.assignedToId;
        console.log('Lead assignedTo data:', {
          leadId: lead._id,
          leadName: lead.name,
          assignedTo: lead.assignedTo,
          assignedToId: assignedToId,
          filterValue: filters.assignedTo,
          matches: assignedToId === filters.assignedTo
        });
        return assignedToId === filters.assignedTo;
      });
      console.log('After assignedTo filter:', filtered.length);
    }
    if (filters.leadPerson) {
      console.log('Filtering by leadPerson:', filters.leadPerson);
      filtered = filtered.filter((lead) => {
        // Check multiple possible data structures for leadPerson
        const leadPersonId = lead.leadPerson?._id || 
                           lead.leadPerson?.id || 
                           lead.assignedBy?._id || 
                           lead.assignedBy?.id || 
                           lead.createdBy?._id || 
                           lead.createdBy?.id ||
                           lead.leadPersonId ||
                           lead.assignedById ||
                           lead.createdById;
        console.log('Lead leadPerson data:', {
          leadId: lead._id,
          leadName: lead.name,
          leadPerson: lead.leadPerson,
          assignedBy: lead.assignedBy,
          createdBy: lead.createdBy,
          leadPersonId: leadPersonId,
          filterValue: filters.leadPerson,
          matches: leadPersonId === filters.leadPerson
        });
        return leadPersonId === filters.leadPerson;
      });
      console.log('After leadPerson filter:', filtered.length);
    }

    console.log('Final filtered results:', filtered.length);
    console.log('Sample filtered lead:', filtered[0]);
    setFilteredLeads(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return "Invalid Date";
    }
  };

  // Modal functions
  const viewLeadDetails = (lead) => {
    setSelectedLead(lead);
  };

  const closeLeadDetails = () => {
    setSelectedLead(null);
  };

  // Open WhatsApp with the phone number
  const openWhatsApp = (phone, countryCode) => {
    if (!phone) return;
    const formattedPhone = `${countryCode || '+91'}${phone.replace(/\D/g, '')}`;
    const whatsappUrl = `https://wa.me/${formattedPhone.replace(/\+/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  // Open email client with the email address
  const openEmail = (email) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  // Status pill colors
  const statusPill = (status) => {
    const base =
      "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    const map = {
      Introduction: "bg-blue-100 text-blue-800",
      Acknowledgement: "bg-yellow-100 text-yellow-800",
      Question: "bg-purple-100 text-purple-800",
      "Future Promise": "bg-red-100 text-red-800",
      Payment: "bg-green-100 text-green-800",
      Analysis:
        "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200",
    };
    return (
      <span
        className={`${base} ${
          map[status] ??
          "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <Layout>
      {/* Full-width content area */}
      <div className="mx-auto w-full max-w-[100vw] px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Leads Management</h1>
          <Link
            to="/leads"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md"
          >
            Standard Leads View
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Collapsible Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title={filtersOpen ? "Collapse filters" : "Expand filters"}
              >
                {/* simple chevron */}
                <span
                  className={`block transition-transform duration-200 ${
                    filtersOpen ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </button>
              <h2 className="text-lg font-medium">Advanced Filters</h2>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>

          {filtersOpen && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder="Search name, email, phone..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Countries</option>
                    {filterOptions.countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label
                    htmlFor="course"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Course
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={filters.course}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Courses</option>
                    {filterOptions.courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label
                    htmlFor="source"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={filters.source}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Sources</option>
                    {filterOptions.sources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label
                    htmlFor="dateFrom"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Date From
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label
                    htmlFor="dateTo"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Date To
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label
                    htmlFor="assignedTo"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Assigned To
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={filters.assignedTo}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Sales Persons</option>
                    {filterOptions.salesPersons.map((sp) => (
                      <option key={sp._id} value={sp._id}>
                        {sp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lead Person */}
                <div>
                  <label
                    htmlFor="leadPerson"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Lead Person
                  </label>
                  <select
                    id="leadPerson"
                    name="leadPerson"
                    value={filters.leadPerson}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2"
                  >
                    <option value="">All Lead Persons</option>
                    {filterOptions.leadPersons.map((lp) => (
                      <option key={lp._id} value={lp._id}>
                        {lp.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md dark:shadow-2xl w-full">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {filteredLeads.length} Leads Found
              </h3>
              <div className="text-sm text-slate-500 dark:text-gray-400">
                Showing filtered results from a total of {leads.length} leads
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-gray-400">
                No leads found matching your filters. Try adjusting your
                criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse text-sm">
                  {/* ===== HEADERS ===== */}
                  <thead className="bg-black text-white uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        #
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Name
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Course
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border border-gray-600">
                        Country
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

                  {/* ===== ROWS ===== */}
                  <tbody>
                    {filteredLeads.map((lead, index) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {index + 1}
                        </td>

                        {/* DATE */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {formatDate(lead.createdAt)}
                        </td>

                        {/* NAME */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          <div>{lead.name}</div>
                          {lead.altName && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {lead.altName}
                            </div>
                          )}
                        </td>

                        {/* CONTACT */}
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

                        {/* COURSE */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {lead.course}
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusPill(lead.status)}`}>
                            {lead.status || "Pending"}
                          </span>
                        </td>

                        {/* COUNTRY */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {lead.country || "N/A"}
                        </td>

                        {/* LEAD PERSON */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {lead.assignedBy?.fullName ||
                            lead.assignedBy?.name ||
                            lead.leadPerson?.fullName ||
                            lead.leadPerson?.name ||
                            lead.createdBy?.fullName ||
                            lead.createdBy?.name ||
                            lead.assignedByName ||
                            lead.createdByName ||
                            "N/A"}
                        </td>

                        {/* ASSIGNED TO */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400">
                          {lead.assignedTo?.fullName ||
                            lead.assignedTo?.name ||
                            lead.assignedToName ||
                            "Unassigned"}
                        </td>

                        {/* ACTION */}
                        <td className="px-4 py-3 text-center border border-gray-300 dark:border-gray-700">
                          <button
                            onClick={() => viewLeadDetails(lead)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg dark:shadow-black/40">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Lead Details
                </h3>
                <button
                  onClick={closeLeadDetails}
                  className="text-gray-400 dark:text-slate-400 hover:text-slate-500 text-2xl"
                >
                  <FaTimes />
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
                  {selectedLead.email ? (
                    <button
                      onClick={() => openEmail(selectedLead.email)}
                      className="text-blue-600 hover:text-blue-800 flex items-center font-semibold"
                    >
                      <FaEnvelope className="mr-1" /> {selectedLead.email}
                    </button>
                  ) : (
                    <span className="font-semibold">N/A</span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Phone:
                  </span>
                  {selectedLead.phone ? (
                    <button
                      onClick={() => openWhatsApp(selectedLead.phone, selectedLead.countryCode)}
                      className="text-green-600 hover:text-green-800 flex items-center font-semibold"
                    >
                      <FaWhatsapp className="mr-1" />{" "}
                      {selectedLead.countryCode || "+91"} {selectedLead.phone}
                    </button>
                  ) : (
                    <span className="font-semibold">N/A</span>
                  )}
                </div>

                {/* Course */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Course:
                  </span>
                  <span className="font-semibold">{selectedLead.course || "N/A"}</span>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Status:
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusPill(selectedLead.status)}`}>
                    {selectedLead.status || "Pending"}
                  </span>
                </div>

                {/* Country */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Country:
                  </span>
                  <span className="font-semibold">{selectedLead.country || "N/A"}</span>
                </div>

                {/* Lead Person */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Lead Person:
                  </span>
                  <span className="font-semibold">
                    {selectedLead.assignedBy?.fullName ||
                      selectedLead.assignedBy?.name ||
                      selectedLead.leadPerson?.fullName ||
                      selectedLead.leadPerson?.name ||
                      selectedLead.createdBy?.fullName ||
                      selectedLead.createdBy?.name ||
                      selectedLead.assignedByName ||
                      selectedLead.createdByName ||
                      "N/A"}
                  </span>
                </div>

                {/* Assigned To */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Assigned To:
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {selectedLead.assignedTo?.fullName || selectedLead.assignedTo?.name || selectedLead.assignedToName || "Unassigned"}
                  </span>
                </div>

                {/* Created At */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Created At:
                  </span>
                  <span className="font-semibold">{formatDate(selectedLead.createdAt)}</span>
                </div>

                {/* Company */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Company:
                  </span>
                  <span className="font-semibold">{selectedLead.company || "N/A"}</span>
                </div>

                {/* Source */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    Source:
                  </span>
                  <span className="font-semibold">{selectedLead.source || "N/A"}</span>
                </div>

                {/* LinkedIn */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    LinkedIn:
                  </span>
                  {selectedLead.sourceLink ? (
                    <a
                      href={selectedLead.sourceLink.startsWith("http") ? selectedLead.sourceLink : `https://${selectedLead.sourceLink}`}
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
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-base">
                  {selectedLead.feedback || "No feedback available"}
                </div>
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

export default AdminLeadsPage;
